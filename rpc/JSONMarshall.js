// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*globals define console*/

define(['lib/q/q'], function (Q) {
  
  // A left paren ( followed by any not-right paren ) followed by right paren
  var reParamList = /\(([^\)]*)\)/; 
  var reParameters = /\(([^\)]*)\)/;
  
  // parse the function source to get the parameter name
  function getParamsFromAPI(fnc) {
    var paramList = [];
    var src = fnc.toString();
    var m = reParamList.exec(src);
    if (m && m[1]) {
      var spacyParamList = m[1].split(',');
      spacyParamList.forEach(function(spacy) {
        var paramName = spacy.trim();
        if (paramName) {
          paramList.push(spacy.trim());
        }
      });
    }
    return paramList;
  }
  
  // build a JSON object for Remote Debugging 
  
  function bindParams(paramNames, argValues) {
    var params = {};
    var max = Math.min(paramNames.length, argValues.length);
    for(var i = 0; i < max; i++) {
      var name = paramNames[i];
      params[name] = argValues[i];
    }
    return params;
  }
 
 
  // global monotonic 
  var serialCounter = 1; // every serial must be truthy
  // promises made and not kept by serial
  var deferredBySerial = {};

  function makeSendRemoteCommand(channel, target, method) {
    // we close over the argumentes
    return function sendRemoteCommand() {  // arguments here will depend upon method
      var params = Array.prototype.slice.apply(arguments, [0]);
      
      // Our sequence number for RPC
      var serial =  serialCounter++;
      
      // store the deferred for recvResponseData
      var deferred = deferredBySerial[serial] = Q.defer();
      var promise = deferred.promise;
      
      // Check for a callback function
      if (typeof params[params.length - 1] === 'function') {
        // remove the callback, otherwise we get a DOM error on serialization
        var callback = params.pop();
        // once we get an answer, send it to the callback
        promise = Q.when(promise, function(promise){
          console.log("callback now "+promise);
          callback(promise);
        }, function() {
          var errMsg = arguments[0];
          if (errMsg && errMsg.method && (errMsg.method === 'onError') && errMsg.params && errMsg.params.length ) {
            console.error("Error "+errMsg.params[0], errMsg.params[1]);
          } else {
            console.error("JSONMarshall sendRemoteCommand ERROR ", arguments);
          }
        });
        promise.end();
      }
      
      var message = {target: target, method: method,  params: params, serial: serial};
      
      channel.postMessage(message);
      // callers can wait on the promise to be resolved by recvResponseData
      return promise; 
    };
  }
  
  function marshallForHandler(impl, handler) {
    return function (objFromJSON, p_id) {
      var args = [];
      for (var i = 0; i < handler.parameters.length; i++) {
        args[i] = objFromJSON[handler.parameters[i]];
      }
      args.push(p_id);  // purple specific clock tick postpended
      handler.apply(impl, args);
    };
  }
  
  //---------------------------------------------------------------------------------------------
  var JSONMarshall = {};


  JSONMarshall.recvEvent = function(p_id, data) {
    // {source: "debugger", name: "response", result: result, request: request}
    if (data && data.source && data.name) {
      if (data.name !== 'response') {
        this.recvEventData(p_id, data);
      }
    }
  };

  JSONMarshall.recvEventData = function(p_id, data) {
    return this.categorize(p_id, data, this.applyToparsedJSON);
  };

  JSONMarshall.categorize = function(p_id, data, thenFnOfIdDataMethod) {
    var splits = data.name.split('.');
    var category = splits[0];
    var methodName = splits[1];
    var handlers = this.jsonHandlers[category];
    if (handlers) {
      var method = handlers[methodName];
      if (method) {
        return thenFnOfIdDataMethod(p_id, data, method);
      }
    }
  };
  
  JSONMarshall.applyToparsedJSON = function(p_id, data, method) {
    try {
      var objFromJSON = data.params;
      if (typeof(objFromJSON) === 'string') {
        objFromJSON = JSON.parse(data.params);
      }
      return method.apply(null, [objFromJSON, p_id]);
    } catch(exc) {
      console.error("JSONMarshall ERROR "+exc, exc.stack, data.params);
    }
  };
  
  JSONMarshall.recvResponse = function(data) {
  console.log("JSONMarshal.recvResponse ", data);
    if (data && data.serial) {
      this.recvResponseData(data);
    } else { // not a response
      console.error("JSONMarshal.recvResponse dropped data, no serial ", data);
    }
  };
  
  
  JSONMarshall.recvResponseData = function(data) {
    var serial = data.serial; // set by sendRemoteCommand
    var deferred = deferredBySerial[serial];
    if (deferred) {
      try {
        if (data.method && (data.method !== 'onError') ) {
          deferred.resolve(data.params[0]);
        } else {
          deferred.reject(data);
        }
      } finally {
        console.log("recvResponseData completed "+serial, data);
        delete deferredBySerial[serial];
      }
    } // else another remote may have created the request
  };
  
  // return two level dictionary of functions for each domain's events.
  JSONMarshall.getEventHandlers = function(iface, impl) {
    var jsonHandlers = {}; // by domain and function name
    var responseHandlerObject = impl.responseHandlers;  // {Debugger:{functions}, Console:{functions}}
    var events = iface.events;
    var domainNames = Object.keys(events);
    domainNames.forEach(function buildDomainResponse(domainName) {
      jsonHandlers[domainName] = {};
      var handlerNames = Object.keys(events[domainName]);
      handlerNames.forEach(function buildHandler(handlerName) {
        var handlerSpec = events[domainName][handlerName]; // an empty function
        var handlersByDomain = responseHandlerObject[domainName];
        if (!handlersByDomain) {
          return;
        }
        var handler = handlersByDomain[handlerName];  // implementation function of
        if (!handler) {
          console.trace("JSONMarshall");
          console.error("JSONMarshall, no handler for "+domainName+"."+handlerName, JSONMarshall);
          throw new Error("JSONMarshall, no handler for "+domainName+"."+handlerName);
        }
        var m = reParameters.exec(handlerSpec.toString());
        var params = m[1].split(',');
        handler.parameters = [];
        for (var i = 0; i < params.length; i++) {
          var param = params[i].trim();
          if (param) {
            handler.parameters[i] = param;
          }
        }
        jsonHandlers[domainName][handlerName] = marshallForHandler(impl, handler);
      }.bind(this));
    });
    return jsonHandlers;
  };
   
  // Walk the API and implement each function to send over channel.
  JSONMarshall.buildPromisingCalls = function(iface, impl, channel) {
    var methods = Object.keys(iface.api);
    methods.forEach(function buildMethod(method) {
      // each RHS is a function returning a promise
      impl[method] = makeSendRemoteCommand(channel, iface.name, method);
    });
    this.bindRecv(channel);
  };
  
  // chrome.debugger remote methods have domain.method names
  JSONMarshall.build2LevelPromisingCalls = function(iface, impl, channel) {
    var api = iface.api;
    var domains = Object.keys(api);
    domains.forEach(function buildSend(domain) {
      impl[domain] = {};
      var methods = Object.keys(api[domain]);
      methods.forEach(function buildMethod(method) {
        // each RHS is a function returning a promise
        impl[domain][method] = makeSendRemoteCommand(channel, iface.name, domain+'.'+method);
      });
    });
    this.bindRecv(channel);
  };
  JSONMarshall.bindRecv = function(channel) {
    // bind promise resolution to the recv 
    if (!this.boundRecv) {
      this.boundRecv = this.recvResponse.bind(this);
    }
    channel.addListener(this.boundRecv);
  };

  return JSONMarshall;

});
