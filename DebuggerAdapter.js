// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global console*/


/*
  Connection handler for one tab to chrome.experimental.debugger
  @param tabId the id of the tab to debug
  @param send function(JSONable object) to forward to app
*/

function makeDebuggerAdapter(chrome, PostSource) {

function DebuggerAdapter(windowsAdapter) {
  this.windowsAdapter = windowsAdapter;
  this.port = windowsAdapter.port;
  this._bindListeners();
  this.api = ['attach', 'sendCommand', 'detach'];
}

var dTemp = chrome.experimental.debugger;
var chrome = {experimental: {'debugger':dTemp}}; 

DebuggerAdapter.path = 'chrome.debugger';


DebuggerAdapter.prototype = {

  //-------------------------------------------------------------------------
  
  attach: function(debuggee, version, callback) {
    if (!this._checkDebuggee(debuggee)) {
      return;
    }
    // prepare for events from chrome.debugger
    chrome.debugger.onEvent.addListener(this.onEvent);
    
    // Setup the connection to the devtools backend
    chrome.debugger.attach({tabId: debuggee.tabId}, version, this.noErrorPosted);
  },
    
  sendCommand: function(debuggee, method, params) {
    if (!this._checkDebuggee(debuggee)) {
      return;
    }
    
    chrome.experiment.debugger.sendCommand(
      {tabId: debuggee.tabId},
      method,
      params,
      this.onResponse.bind(this, method, params)
    );
  },
  
  detach: function(debuggee) {
    if (!this._checkDebuggee(debuggee)) {
      return;
    }
    
    chrome.debugger.detach({tabId: debuggee.tabId}, this.noErrorPosted);
  },
  
  //-------------------------------------------------------------------------
  // Implementation 
  
  // Forward debugger events as JSON
  onEvent: function(debuggee, method, params) {
    // causes lots of logging      console.log("MonitorChrome: Debugger.onEvent "+method+" in tab "+debuggee.tabId+" vs this.tabId:"+this.tabId, params);
    if ( this.windowsAdapter.isAccessibleTab(debuggee.tabId) ) {
      this.postMessage({source: this.getPath(), method: method, params: params}); 
    }
  },
  
  // Forward command responses from Chrome to App
  onResponse: function(method, params, result) {
    if (!this.noErrorPosted()) {
      var request = {method: method, params: params};
      this.postMessage({source: this.getPath(), method: "OnResponse", params: [result], request: request});
    } 
  },
  
  // The browser backend announced detach
  onDetach: function(debuggee) {
    if ( this.windowsAdapter.isAccessibleTab(debuggee.tabId) ) {
      this.postMessage({source: this.getPath(), method: "onDetach", params:[debuggee]}); 
    }
  },
  
  _checkDebuggee: function(debuggee) {
    if (!this.windowsAdapter.isAccessibleTab(debuggee.tabId)) {
       this.postError("Debuggee tabId "+debuggee.tabId+" is not accessible");
       return false;
    }
	return true;
  },
  
  // Call exactly once
  _bindListeners: function() {
    this.onEvent = this.onEvent.bind(this);
    // onResponse bound for each call
    this.onDetach = this.onDetach.bind(this);
  }
};

  var postSource = new PostSource(DebuggerAdapter.path);
  Object.keys(postSource).forEach(function(key) {
    DebuggerAdapter.prototype[key] = postSource[key];   
  });


  return DebuggerAdapter;
}

