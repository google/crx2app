// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global define console window */
define(  ['crx2app/rpc/ChromeDebuggerProxy'], 
  function(            ChromeDebuggerProxy) {
  
  function output() {
    window.parent.postMessage(arguments,"*");
  }
  
  var DemoDebugger = ChromeDebuggerProxy.extend({
  
    // Implement Remote.events
    eventHandlers: {
      Debugger: {
        breakpointResolved: function(breakpointId, location) {
          output("DemoDebugger", arguments);
        },
        paused: function(details) {
          output("DemoDebugger paused", arguments);
        },
        resumed: function() {
          output("DemoDebugger", arguments);
        },
        scriptFailedToParse: function(data, errorLine, errorMessage, firstLine, url) {
          output("DemoDebugger", arguments);
        },
        scriptParsed: function(endColumn, endLine, isContentScript, scriptId, startColumn, startLine, url, p_id) {
          output('scriptParsed '+url);
        }
      },
      Timeline: {
        eventRecorded: function(record) {
          output("DemoDebugger", arguments);
        },
        started: function() {
          output("DemoDebugger", arguments);
        },
        stopped: function() {
          output("DemoDebugger", arguments);
        }
      }
    },

    initialize: function(connection) {
      ChromeDebuggerProxy.initialize.apply(this, [this.eventHandlers, connection]);
    }
  
  });


  return DemoDebugger;
});