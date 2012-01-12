// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*global console*/


/*
  Connection handler for one tab to chrome.debugger
  @param tabId the id of the tab to debug
  @param send function(JSONable object) to forward to app
*/

function makeDebuggerAdapter(chrome, PostSource, remote) {

function DebuggerAdapter(windowsAdapter) {
  this.windowsAdapter = windowsAdapter;
  this.windowsAdapter.setDebugAdapter(this);   // backpointer for disconnect

  this.debuggeeTabIds = [];
  
  var portDelegate = new PostSource(DebuggerAdapter.path);
  Object.keys(portDelegate).forEach(function(key) {
    this[key] = portDelegate[key].bind(windowsAdapter);   
  }.bind(this));
  
  this._bindListeners();
  this.api = ['attach', 'sendCommand', 'detach'];
  this.addListeners();
}

DebuggerAdapter.path = 'chrome.debugger';


DebuggerAdapter.prototype = {

  //-------------------------------------------------------------------------
  
  chromeWrappers: {
    attach: function(serial, debuggee, version, callback) {
      if (!this._checkDebuggee(debuggee)) {
        return;
      }
      this.debuggeeTabIds.push(debuggee.tabId);
    
      this.addListeners();
      
      // Setup the connection to the devtools backend
      chrome.debugger.attach(debuggee, version, this.onAttach.bind(this, serial));
    },
    
    sendCommand: function(serial, debuggee, method, params) {
      if (!this._checkDebuggee(debuggee)) {
        return;
      }
      
      chrome.debugger.sendCommand(
        { tabId: debuggee.tabId },
        method,
        params,
        this.onResponse.bind(this, serial, {method: method, params:params})  // PostSource.onResponse
      );
    },
  
    detach: function(serial, debuggee) {
      if (!this._checkDebuggee(debuggee)) {
        return; 
      }
      chrome.debugger.detach({tabId: debuggee.tabId}, this.noErrorPosted);
      
      this.onRemoved(debuggee.tabId, {});
    }
  },
  
  //-------------------------------------------------------------------------
  
  // Forward debugger events as JSON
  onEvent: function(debuggee, method, params) {
    // causes lots of logging      console.log("MonitorChrome: Debugger.onEvent "+method+" in tab "+debuggee.tabId+" vs this.tabId:"+this.tabId, params);
    if ( this.windowsAdapter.isAccessibleTab(debuggee.tabId) ) {
      this.postMessage({source: this.getPath(), method: method, params: params}); 
    }
  },
  
  onAttach: function(serial) {
    if ( this.noErrorPosted({serial: serial}) ) {
      this.postMessage({source: this.getPath(), method: "onAttach", serial: serial, params:[]});
    }
  },
  
  // The browser backend announced detach
  onDetach: function(debuggee) {
    if ( this.windowsAdapter.isAccessibleTab(debuggee.tabId) ) {
      this.postMessage({source: this.getPath(), method: "onDetach", params:[debuggee]}); 
    }
  },
  
  // The debuggee tab was removed
  onRemoved: function(tabId, removeInfo) {
    var index = this.debuggeeTabIds.indexOf(tabId);
    if (index > -1) {
      this.debuggeeTabIds.splice(index, 1);
    } // else not ours
  },
  //---------------------------------------------------------------------------
  // class methods
  _checkDebuggee: function(debuggee) {
    if (!debuggee) {
      this.postError("crx2app.DebuggerAdapter no debuggee");
      return false;
    }
    if (!this.windowsAdapter.isAccessibleTab(debuggee.tabId)) {
       this.postError("Debuggee tabId "+debuggee.tabId+" is not accessible");
       return false;
    }
	return true;
  },
  
  disconnect: function() {
    this.debuggeeTabIds.forEach(function (tabId) {
      this.chromeWrappers.detach(undefined, tabId);
    });
    this.removeListeners();
  },
  
  addListeners: function() {
      // prepare for events from chrome.debugger
      chrome.debugger.onEvent.addListener(this.onEvent);
      // detach if the tab is removed
      chrome.tabs.onRemoved.addListener(this.onRemoved);
  },
  
  removeListeners: function() {
      chrome.debugger.onEvent.removeListener(this.onEvent);
      chrome.tabs.onRemoved.removeListener(this.onRemoved);
  },
  
  // Call exactly once
  _bindListeners: function() {
    this.onEvent = this.onEvent.bind(this);
    // onResponse bound for each call
    this.onDetach = this.onDetach.bind(this);
    this.onRemoved = this.onRemoved.bind(this);
  }
  
};

  return DebuggerAdapter;
}

