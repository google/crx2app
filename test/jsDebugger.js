// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global define console */

define(  ['remoteByWebInspector'], 
function ( remoteByWebInspector) {
  
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
  jsDebugger.responseHandlers = {
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
  
  //---------------------------------------------------------------------------------------------
  
  jsDebugger.connect = function(channel) {
      this.remote = Object.create(remoteByWebInspector);
      this.remote._addHandlers(this);
      this.remote.buildImplementation(this, channel);
      
	  return this.promiseStartDebugger();
  };
  
  jsDebugger.disconnect = function(channel) {
      this.stopDebugger();
      this.remote.disconnect(channel);
  };

  return jsDebugger;
});