
/*global console*/

// @param return from appEnd getChromeExtensionPipe()

function Debugger(connection) {
  this.connection = connection;
}

Debugger.prototype = {
  
  send: function(target, method, params) {
    this.connection.postMessage({target: target, method: method, params: params});
  },
  
  promiseResponse: function(request, filter) {
    var deferred = Q.defer();
    // close over the deferred for resolution upon response
    this.connection.addListener(function(msgObj) {
      if (!msgObj.source || !msgObj.method || !msgObj.params) {
        deferred.reject(msgObj);
      } else {
        if (
          msgObj.source === filter[0] && 
          msgObj.method === filter[1]) {
          
          deferred.resolve(msgObj.params);
        } else {
          console.log("Debugger.promiseResponse ignoring filtered message", msgObj);
        }
      }
    }.bind(this));
    this.send.apply(this, request);
    return deferred.promise;
  },
  
  promiseWindow: function() {
    return this.promiseResponse(
      ['chrome.windows', 'create', [{}] ],
      ['chrome.windows', 'onCreated']
      );
  } 
};

// Debugging 
var _send = Debugger.prototype.send; 
Debugger.prototype.send = function() {
  if ( typeof arguments[0] !== 'string' ) {
    throw new Error("First argument must be a string");
  }
  if ( typeof arguments[1] !== 'string' ) {
    throw new Error("Second argument must be a string");
  }
  if (!arguments[2] instanceof Array) {
    throw new Error("Third argument must be an array");
  }
  console.log("Debugger send", this, arguments);
  return _send.apply(this, arguments);
};