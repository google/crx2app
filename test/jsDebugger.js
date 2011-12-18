// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global define console */
console.log('jsDebugger.js loaded');
define(  ['../rpc/JSONMarshall', '../rpc/remote', '../rpc/chrome'], 
  function(JSONMarshall, remote, chrome) {
  
  var jsDebugger = {};
  
  //---------------------------------------------------------------------------------------------
  //
  jsDebugger.promiseStartDebugger = function() {
    return this.remote.Debugger.enable();
  };
  
  jsDebugger.stopDebugger = function() {
    this.remote.Debugger.disable();
  };
    
  // Implement Remote.events
  jsDebugger.remoteResponseHandlers = {
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
  jsDebugger.chromeResponseHandlers = {
    
  };
  
  //---------------------------------------------------------------------------------------------
  
  jsDebugger.connect = function(channel) {
      this.remote = Object.create(JSONMarshall);
      this.remote.responseHandlers = this.remoteResponseHandlers;
      this.remote.addHandlers(remote, this.remote);
      this.remote.buildImplementation(remote, this.remote, channel);
      
      this.chrome = Object.create(JSONMarshall);
      this.chrome.responseHandlers = this.chromeResponseHandlers;
      this.chrome.addHandlers(chrome, this.chrome);
      this.chrome.buildImplementation(chrome, this.chrome, channel);
  };
  
  jsDebugger.disconnect = function(channel) {
      this.stopDebugger();
      this.remote.disconnect(channel);
      this.chrome.disconnect(channel);
  };

  return jsDebugger;
});