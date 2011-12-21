// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global define console */
console.log('JavaScriptDebugger.js loaded');
define(  ['lib/q/q', '../rpc/JSONMarshall', '../rpc/remote', '../rpc/chrome'], 
  function(Q, JSONMarshall, remote, chrome) {
  
  var JavaScriptDebugger = function(tabId) {
    this.tabId = tabId;
  };
  
  //---------------------------------------------------------------------------------------------
  //
    
  // Implement Remote.events
  JavaScriptDebugger.prototype.remoteResponseHandlers = {
    Debugger: {
        breakpointResolved: function(breakpointId, location) {
          console.log("JavaScriptEventHandler", arguments);
        },
        paused: function(details) {
          console.log("JavaScriptEventHandler paused", arguments);
        },
        resumed: function() {
          console.log("JavaScriptEventHandler", arguments);
        },
        scriptFailedToParse: function(data, errorLine, errorMessage, firstLine, url) {
          console.log("JavaScriptEventHandler", arguments);
        },
        scriptParsed: function(endColumn, endLine, isContentScript, scriptId, startColumn, startLine, url, p_id) {
          console.log('scriptParsed '+url);
        }
      },
      Timeline: {
        eventRecorded: function(record) {
          console.log("JavaScriptEventHandler", arguments);
        },
        started: function() {
          console.log("JavaScriptEventHandler", arguments);
        },
        stopped: function() {
          console.log("JavaScriptEventHandler", arguments);
        }
      }
  };
  
  /*
   * create debugger for url in a new Chrome window 
   * @param url, string URL
   * @param connection, result from getChromeExtensionPipe
   * @param chromeProxy, object representing "chrome" extension API
   * @return promise for JavaScriptDebugger  
   */
  JavaScriptDebugger.openInDebug = function(url, connection, chromeProxy) {
    var deferred = Q.defer();
    chromeProxy.windows.create({},  function onCreated(win) {
      console.log("JavaScriptDebugger openInDebug onCreated callback, trying connect", win);
      var tabId = win.tabs[0].id;
      
      var jsDebugger = new JavaScriptDebugger(tabId);
    
      var connected = jsDebugger.connect(chromeProxy);
      Q.when(connected, function(connected) {
        console.log("JavaScriptDebugger openInDebug connected, send enable", connected);
        var enabled = jsDebugger.remote.Debugger.enable();
    
        Q.when(enabled, function(enabled) {
          console.log("JavaScriptDebugger openInDebug enabled", enabled);
          chromeProxy.tabs.update(tabId, {url: url}, function(tab) {
            return deferred.resolve(jsDebugger);
          });
        }).end();
      }).end();
      
    });
    return deferred.promise;
  };
  
  //---------------------------------------------------------------------------------------------
  
  JavaScriptDebugger.prototype.connect = function(chromeProxy) {
      this.remote = Object.create(JSONMarshall);
      this.remote.responseHandlers = this.remoteResponseHandlers;
      this.remote.jsonHandlers = this.remote.getEventHandlers(remote, this.remote);
      // We prefix the argument list with our tabId
      this.remote.build2LevelPromisingCalls(remote, this.remote, chromeProxy.getConnection(), [{tabId: this.tabId}]);
      return chromeProxy.debugger.attach({tabId: this.tabId}, remote.version);
  };
  
  JavaScriptDebugger.prototype.disconnect = function(channel) {
      this.stopDebugger();
      this.remote.disconnect(channel);
  };

  return JavaScriptDebugger;
});