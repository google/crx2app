/* Machine generated from inspector/Inspector.json version: 0.1 on Thu Jan 19 2012 14:54:46 GMT-0800 (PST) */

define([], function() {

var chrome = chrome || {};
chrome.debugger = chrome.debugger || {};

chrome.debugger.remote = {version:  0.1};

/* unsupported */ 
chrome.debugger.remote.Inspector = {
  commands: {
    enable:  function(){},
    disable:  function(){},
  },
  events: {
    evaluateForTestInFrontend: function(testCallId, script) {},
    inspect: function(object, hints) {},
    didCreateWorker: function(id, url, isShared) {},
    didDestroyWorker: function(id) {},
  }
};

/* unsupported */ 
chrome.debugger.remote.Memory = {
  commands: {
    getDOMNodeCount: /*count */ function(){},
  },
};


chrome.debugger.remote.Page = {
  commands: {
    enable:  function(){},
    disable:  function(){},
    /* unsupported */ addScriptToEvaluateOnLoad: /*identifier */ function(scriptSource){},
    /* unsupported */ removeScriptToEvaluateOnLoad:  function(identifier){},
    reload:  function(ignoreCache, scriptToEvaluateOnLoad){},
    /* unsupported */ open:  function(url, newWindow){},
    /* unsupported */ getCookies: /*cookies,cookiesString */ function(){},
    /* unsupported */ deleteCookie:  function(cookieName, domain){},
    /* unsupported */ getResourceTree: /*frameTree */ function(){},
    /* unsupported */ getResourceContent: /*content,base64Encoded */ function(frameId, url){},
    /* unsupported */ searchInResource: /*result */ function(frameId, url, query, caseSensitive, isRegex){},
    /* unsupported */ searchInResources: /*result */ function(text, caseSensitive, isRegex){},
  },
  events: {
    domContentEventFired: function(timestamp) {},
    loadEventFired: function(timestamp) {},
    /* unsupported */ frameNavigated: function(frame) {},
    /* unsupported */ frameDetached: function(frameId) {},
  }
};


chrome.debugger.remote.Runtime = {
  commands: {
    evaluate: /*result,wasThrown */ function(expression, objectGroup, includeCommandLineAPI, doNotPauseOnExceptions, frameId, returnByValue){},
    callFunctionOn: /*result,wasThrown */ function(objectId, functionDeclaration, arguments, returnByValue){},
    getProperties: /*result */ function(objectId, ownProperties){},
    releaseObject:  function(objectId){},
    releaseObjectGroup:  function(objectGroup){},
    /* unsupported */ run:  function(){},
  },
};


chrome.debugger.remote.Console = {
  commands: {
    enable:  function(){},
    disable:  function(){},
    clearMessages:  function(){},
    /* unsupported */ setMonitoringXHREnabled:  function(enabled){},
    /* unsupported */ addInspectedNode:  function(nodeId){},
  },
  events: {
    messageAdded: function(message) {},
    messageRepeatCountUpdated: function(count) {},
    messagesCleared: function() {},
  }
};


chrome.debugger.remote.Network = {
  commands: {
    enable:  function(){},
    disable:  function(){},
    setUserAgentOverride:  function(userAgent){},
    setExtraHTTPHeaders:  function(headers){},
    getResponseBody: /*body,base64Encoded */ function(requestId){},
    canClearBrowserCache: /*result */ function(){},
    clearBrowserCache:  function(){},
    canClearBrowserCookies: /*result */ function(){},
    clearBrowserCookies:  function(){},
    setCacheDisabled:  function(cacheDisabled){},
  },
  events: {
    requestWillBeSent: function(requestId, frameId, loaderId, documentURL, request, timestamp, initiator, stackTrace, redirectResponse) {},
    requestServedFromCache: function(requestId) {},
    responseReceived: function(requestId, frameId, loaderId, timestamp, type, response) {},
    dataReceived: function(requestId, timestamp, dataLength, encodedDataLength) {},
    loadingFinished: function(requestId, timestamp) {},
    loadingFailed: function(requestId, timestamp, errorText, canceled) {},
    requestServedFromMemoryCache: function(requestId, frameId, loaderId, documentURL, timestamp, initiator, resource) {},
    /* unsupported */ webSocketWillSendHandshakeRequest: function(requestId, timestamp, request) {},
    /* unsupported */ webSocketHandshakeResponseReceived: function(requestId, timestamp, response) {},
    /* unsupported */ webSocketCreated: function(requestId, url) {},
    /* unsupported */ webSocketClosed: function(requestId, timestamp) {},
  }
};

/* unsupported */ 
chrome.debugger.remote.Database = {
  commands: {
    enable:  function(){},
    disable:  function(){},
    getDatabaseTableNames: /*tableNames */ function(databaseId){},
    executeSQL: /*success,transactionId */ function(databaseId, query){},
  },
  events: {
    addDatabase: function(database) {},
    sqlTransactionSucceeded: function(transactionId, columnNames, values) {},
    sqlTransactionFailed: function(transactionId, sqlError) {},
  }
};

/* unsupported */ 
chrome.debugger.remote.DOMStorage = {
  commands: {
    enable:  function(){},
    disable:  function(){},
    getDOMStorageEntries: /*entries */ function(storageId){},
    setDOMStorageItem: /*success */ function(storageId, key, value){},
    removeDOMStorageItem: /*success */ function(storageId, key){},
  },
  events: {
    addDOMStorage: function(storage) {},
    updateDOMStorage: function(storageId) {},
  }
};

/* unsupported */ 
chrome.debugger.remote.ApplicationCache = {
  commands: {
    getFramesWithManifests: /*frameIds */ function(){},
    enable:  function(){},
    getManifestForFrame: /*manifestURL */ function(frameId){},
    getApplicationCacheForFrame: /*applicationCache */ function(frameId){},
  },
  events: {
    applicationCacheStatusUpdated: function(frameId, manifestURL, status) {},
    networkStateUpdated: function(isNowOnline) {},
  }
};

/* unsupported */ 
chrome.debugger.remote.FileSystem = {
  commands: {
    enable:  function(){},
    disable:  function(){},
  },
};


chrome.debugger.remote.DOM = {
  commands: {
    getDocument: /*root */ function(){},
    requestChildNodes:  function(nodeId){},
    querySelector: /*nodeId */ function(nodeId, selector){},
    querySelectorAll: /*nodeIds */ function(nodeId, selector){},
    setNodeName: /*nodeId */ function(nodeId, name){},
    setNodeValue:  function(nodeId, value){},
    removeNode:  function(nodeId){},
    setAttributeValue:  function(nodeId, name, value){},
    setAttributesAsText:  function(nodeId, text, name){},
    removeAttribute:  function(nodeId, name){},
    /* unsupported */ getEventListenersForNode: /*listeners */ function(nodeId){},
    /* unsupported */ copyNode:  function(nodeId){},
    getOuterHTML: /*outerHTML */ function(nodeId){},
    setOuterHTML: /*nodeId */ function(nodeId, outerHTML){},
    /* unsupported */ performSearch: /*searchId,resultCount */ function(query){},
    /* unsupported */ getSearchResults: /*nodeIds */ function(searchId, fromIndex, toIndex){},
    /* unsupported */ discardSearchResults:  function(searchId){},
    requestNode: /*nodeId */ function(objectId){},
    /* unsupported */ setInspectModeEnabled:  function(enabled, highlightConfig){},
    highlightRect:  function(x, y, width, height, color, outlineColor){},
    highlightNode:  function(nodeId, highlightConfig){},
    hideHighlight:  function(){},
    /* unsupported */ highlightFrame:  function(frameId, contentColor, contentOutlineColor){},
    /* unsupported */ pushNodeByPathToFrontend: /*nodeId */ function(path){},
    resolveNode: /*object */ function(nodeId, objectGroup){},
    getAttributes: /*attributes */ function(nodeId){},
    moveTo: /*nodeId */ function(nodeId, targetNodeId, insertBeforeNodeId){},
  },
  events: {
    documentUpdated: function() {},
    setChildNodes: function(parentId, nodes) {},
    attributeModified: function(nodeId, name, value) {},
    attributeRemoved: function(nodeId, name) {},
    /* unsupported */ inlineStyleInvalidated: function(nodeIds) {},
    characterDataModified: function(nodeId, characterData) {},
    childNodeCountUpdated: function(nodeId, childNodeCount) {},
    childNodeInserted: function(parentNodeId, previousNodeId, node) {},
    childNodeRemoved: function(parentNodeId, nodeId) {},
  }
};

/* unsupported */ 
chrome.debugger.remote.CSS = {
  commands: {
    enable:  function(){},
    disable:  function(){},
    getMatchedStylesForNode: /*matchedCSSRules,pseudoElements,inherited */ function(nodeId, forcedPseudoClasses, includePseudo, includeInherited){},
    getInlineStylesForNode: /*inlineStyle,styleAttributes */ function(nodeId){},
    getComputedStyleForNode: /*computedStyle */ function(nodeId, forcedPseudoClasses){},
    getAllStyleSheets: /*headers */ function(){},
    getStyleSheet: /*styleSheet */ function(styleSheetId){},
    getStyleSheetText: /*text */ function(styleSheetId){},
    setStyleSheetText:  function(styleSheetId, text){},
    setPropertyText: /*style */ function(styleId, propertyIndex, text, overwrite){},
    toggleProperty: /*style */ function(styleId, propertyIndex, disable){},
    setRuleSelector: /*rule */ function(ruleId, selector){},
    addRule: /*rule */ function(contextNodeId, selector){},
    getSupportedCSSProperties: /*cssProperties */ function(){},
    startSelectorProfiler:  function(){},
    stopSelectorProfiler: /*profile */ function(){},
  },
  events: {
    mediaQueryResultChanged: function() {},
  }
};


chrome.debugger.remote.Timeline = {
  commands: {
    start:  function(maxCallStackDepth){},
    stop:  function(){},
  },
  events: {
    eventRecorded: function(record) {},
  }
};


chrome.debugger.remote.Debugger = {
  commands: {
    /* unsupported */ causesRecompilation: /*result */ function(){},
    /* unsupported */ supportsNativeBreakpoints: /*result */ function(){},
    enable:  function(){},
    disable:  function(){},
    setBreakpointsActive:  function(active){},
    setBreakpointByUrl: /*breakpointId,locations */ function(lineNumber, url, urlRegex, columnNumber, condition){},
    setBreakpoint: /*breakpointId,actualLocation */ function(location, condition){},
    removeBreakpoint:  function(breakpointId){},
    continueToLocation:  function(location){},
    stepOver:  function(){},
    stepInto:  function(){},
    stepOut:  function(){},
    pause:  function(){},
    resume:  function(){},
    searchInContent: /*result */ function(scriptId, query, caseSensitive, isRegex){},
    canSetScriptSource: /*result */ function(){},
    setScriptSource: /*callFrames,result */ function(scriptId, scriptSource, preview){},
    getScriptSource: /*scriptSource */ function(scriptId){},
    getFunctionLocation: /*location */ function(functionId){},
    setPauseOnExceptions:  function(state){},
    evaluateOnCallFrame: /*result,wasThrown */ function(callFrameId, expression, objectGroup, includeCommandLineAPI, returnByValue){},
  },
  events: {
    globalObjectCleared: function() {},
    scriptParsed: function(scriptId, url, startLine, startColumn, endLine, endColumn, isContentScript, sourceMapURL) {},
    scriptFailedToParse: function(url, scriptSource, startLine, errorLine, errorMessage) {},
    breakpointResolved: function(breakpointId, location) {},
    paused: function(callFrames, reason, data) {},
    resumed: function() {},
  }
};


chrome.debugger.remote.DOMDebugger = {
  commands: {
    setDOMBreakpoint:  function(nodeId, type){},
    removeDOMBreakpoint:  function(nodeId, type){},
    setEventListenerBreakpoint:  function(eventName){},
    removeEventListenerBreakpoint:  function(eventName){},
    setXHRBreakpoint:  function(url){},
    removeXHRBreakpoint:  function(url){},
  },
};

/* unsupported */ 
chrome.debugger.remote.Profiler = {
  commands: {
    causesRecompilation: /*result */ function(){},
    isSampling: /*result */ function(){},
    hasHeapProfiler: /*result */ function(){},
    enable:  function(){},
    disable:  function(){},
    start:  function(){},
    stop:  function(){},
    getProfileHeaders: /*headers */ function(){},
    getProfile: /*profile */ function(type, uid){},
    removeProfile:  function(type, uid){},
    clearProfiles:  function(){},
    takeHeapSnapshot:  function(){},
    collectGarbage:  function(){},
    getObjectByHeapObjectId: /*result */ function(objectId){},
  },
  events: {
    addProfileHeader: function(header) {},
    addHeapSnapshotChunk: function(uid, chunk) {},
    finishHeapSnapshot: function(uid) {},
    setRecordingProfile: function(isProfiling) {},
    resetProfiles: function() {},
    reportHeapSnapshotProgress: function(done, total) {},
  }
};

/* unsupported */ 
chrome.debugger.remote.Worker = {
  commands: {
    setWorkerInspectionEnabled:  function(value){},
    sendMessageToWorker:  function(workerId, message){},
    connectToWorker:  function(workerId){},
    disconnectFromWorker:  function(workerId){},
    setAutoconnectToWorkers:  function(value){},
  },
  events: {
    workerCreated: function(workerId, url, inspectorConnected) {},
    workerTerminated: function(workerId) {},
    dispatchMessageFromWorker: function(workerId, message) {},
    disconnectedFromWorker: function() {},
  }
};

/* copyright 2011 Google, inc. johnjbarton@google.com Google BSD License */
/* See https://github.com/johnjbarton/atopwi/blob/master/tailFeathers.html */

return chrome.debugger.remote;
});