// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global define console */
define(  ['ScriptDebuggerProxy'], 
  function(ScriptDebuggerProxy) {
  
  var DemoDebugger = ScriptDebuggerProxy.extend({
  
    // Implement Remote.events
    eventHandlers: {
      Debugger: {
        breakpointResolved: function(breakpointId, location) {
          console.log("DemoDebugger", arguments);
        },
        paused: function(details) {
          console.log("DemoDebugger paused", arguments);
        },
        resumed: function() {
          console.log("DemoDebugger", arguments);
        },
        scriptFailedToParse: function(data, errorLine, errorMessage, firstLine, url) {
          console.log("DemoDebugger", arguments);
        },
        scriptParsed: function(endColumn, endLine, isContentScript, scriptId, startColumn, startLine, url, p_id) {
          console.log('scriptParsed '+url);
        }
      },
      Timeline: {
        eventRecorded: function(record) {
          console.log("DemoDebugger", arguments);
        },
        started: function() {
          console.log("DemoDebugger", arguments);
        },
        stopped: function() {
          console.log("DemoDebugger", arguments);
        }
      }
    },

    initialize: function() {
      ScriptDebuggerProxy.initialize.apply(this, [this.eventHandlers]);
    }
  
  });


  return DemoDebugger;
});