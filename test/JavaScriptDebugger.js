// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global define console */
console.log('JavaScriptDebugger.js loaded');
define(  ['lib/q/q', '../rpc/JSONMarshall', '../rpc/remote', '../rpc/chrome'], 
  function(Q, JSONMarshall, remote, chrome) {
  
  var JavaScriptDebugger = function(tabId, connection) {
    this.tabId = tabId;
    this.connect(connection);
  };
  
  //---------------------------------------------------------------------------------------------
  //
  JavaScriptDebugger.prototype.promiseStartDebugger = function() {
    return this.remote.Debugger.enable();
  };
  
  JavaScriptDebugger.prototype.stopDebugger = function() {
    this.remote.Debugger.disable();
  };
    
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
  JavaScriptDebugger.prototype.chromeResponseHandlers = {
    
  };
  
  JavaScriptDebugger.openInDebug = function(url, connection, chromeProxy) {
    var deferred = Q.defer();
    chromeProxy.windows.create({},  function onCreated(win) {
      console.log("JavaScriptDebugger openInDebug onCreated callback", win);
      var tabId = win.tabs[0].id;
      var jsDebugger = new JavaScriptDebugger(tabId, connection);
    
      var enabled = jsDebugger.remote.Debugger.enable();
    
      Q.when(enabled, function(enabled) {
        chromeProxy.tabs.update({url: url}, function(tab) {
          return deferred.resolve(jsDebugger);
        });
      });
    });
    return deferred.promise;
  };
  
  //---------------------------------------------------------------------------------------------
  
  JavaScriptDebugger.prototype.connect = function(channel) {
      this.remote = Object.create(JSONMarshall);
      this.remote.responseHandlers = this.remoteResponseHandlers;
      this.remote.addHandlers(remote, this.remote);
      this.remote.buildImplementation(remote, this.remote, channel);
      
     
  };
  
  JavaScriptDebugger.prototype.disconnect = function(channel) {
      this.stopDebugger();
      this.remote.disconnect(channel);
  };

  return JavaScriptDebugger;
});