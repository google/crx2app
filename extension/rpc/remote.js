// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global define*/

define([], function () {

  // These methods are defined ultimately in InspectorBackendStub.js on chrome source code
  var remote = {
    name: "chrome.debugger",
    version: "0.1",
    api: { // These will be mapped to functions returning promises
      Console: {
        enable: function(){},
        disable: function(){},
        clearMessages: function(){}
      },
      Debugger: {
        continueToLocation: function(location) {},
        disable: function() {},
        enable: function() {},
        evaluateOnCallFrame: function(callFrameId, expression, includeCommandLineAPI, objectGroup, returnByValue) {},
        getScriptSource: function(scriptId) {},
        pause: function() {},
        removeBreakpoint: function(breakpointId) {},
        resume: function() {},
        setBreakpoint: function(condition, location) {},
        setBreakpointByUrl: function(columnNumber, condition, lineNumber, url, urlRegex) {},
        setBreakpointsActive: function(active) {},
        setPauseOnExceptions: function(state) {},
        setScriptSource: function(preview, scritpId, scriptSource) {},
        stepInto: function() {},
        stepOut: function() {},
        stepOver: function() {}
      },
      Network: {
        clearBrowserCache: function(){},
        clearBrowserCookies: function(){},
        disable: function(){},
        enable: function() {},
        getResponseBody: function(requestId){},
        setCacheDisabled: function(cacheDisabled){},
        setExtraHTTPHeaders: function(headers){},
        setUserAgentOverride: function(userAgent){}
      },
      Timeline: {
        start: function(maxCallStackDepth){}, // default 5
        stop: function() {}
      },
      setResponseHandler: function (eventsHandlerObject) {} // implements events
    },
    events: {
      Console: {
        messageAdded: function(message) {},
        messageRepeatCountUpdated: function(count) {},
        messagesCleared: function() {}
      },
      Debugger: {
        breakpointResolved: function(breakpointId, location) {},
        paused: function(details) {},
        resumed: function() {},
        scriptFailedToParse: function(data, errorLine, errorMessage, firstLine, url) {},
        scriptParsed: function(endColumn, endLine, isContentScript, scriptId, startColumn, startLine, url) {}
      },
      Network: {
        dataReceived: function(requestId, timestamp, dataLength, encodedDataLength){},
        loadingFailed: function(requestId, timestamp, errorText, canceled){},
        loadingFinished: function(requestId, timestamp){},
        requestServedFromCache: function(requestId){},
        requestServedFromMemoryCache: function(requestId, loaderId, documentURL, timestamp, initiator, resource){},
        requestWillBeSent: function(requestId, loaderId, documentURL, request, timestamp, initiator, stackTrace, redirectResponse){},
        responseRecieved: function(requestId, timestamp, type, response){}
      },
      Timeline: {
        eventRecorded: function(record) {},
        started: function() {},
        stopped: function() {}
      },
      WebNavigation: {
        onBeforeNavigate: function(details) {},
        onBeforeRetarget: function(details) {},
        onCommitted: function(details) {},
        onCompleted: function(details) {},
        onDOMContentLoaded: function(details) {},
        onErrorOccurred: function(details) {}
      }
    },
    types: {
      CallFrame: {
        functionName: 'string',
        id: 'string',
        location: 'Location',
        scopeChain: '[Scope]',
        'this': 'Runtime.RemoteObject'
      },
      Location: {
        columnNumber: 'integer',
        lineNumber: 'integer',
        scriptId: 'string'
      },
      Scope: {
        object: 'Runtime.RemoteObject',
        'type': 'string'
      },
      TimelineEvent: {
        children: '[TimelineEvent]',
        data: 'object',
        type: 'string'
      },
      ConsoleMessage: {
        level: ['debug', 'error', 'log', 'tip', 'error'],
        line: 'integer',
        networkRequestId: 'Network.RequestId',
        parameters: '[Runtime.RemoteObject]',
        repeatCount: 'integer',
        source: ['console-api', 'html', 'javascript', 'network', 'other', 'wml', 'xml'],
        stackTrace: 'StackTrace',
        text: 'string',
        type: ['assert', 'dir', 'dirxml', 'endGroup', 'log', 'startGroup', 'startGroupCollapsed', 'trace'],
        url: 'string'
      },
      Response: {
        connectionId: 'integer',
        connectionReused: 'boolean',
        fromDiskCache: 'boolean',
        headers: '[]', // ??
        headerText: 'string',
        mimeType: 'string', 
        requestHeaders: '[]', 
        requestHeadersTest: 'string',
        status: 'integer',
        timing: 'ResourceTiming',
        url: 'string'
      }
    }
  };
  
  return remote;
});