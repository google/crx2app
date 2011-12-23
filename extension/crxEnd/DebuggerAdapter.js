// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*global console*/


/*
  Connection handler for one tab to chrome.experimental.debugger
  @param tabId the id of the tab to debug
  @param send function(JSONable object) to forward to app
*/

function makeDebuggerAdapter(chrome, PostSource, remote) {

function DebuggerAdapter(windowsAdapter) {
  this.windowsAdapter = windowsAdapter;
  this.debuggeeTabIds = [];
  
  var portDelegate = new PostSource(DebuggerAdapter.path);
  Object.keys(portDelegate).forEach(function(key) {
    this[key] = portDelegate[key].bind(windowsAdapter);   
  }.bind(this));
  this.setPort( windowsAdapter.port );
  
  this._bindListeners();
  this._buildAPI(remote);
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
    
      // prepare for events from chrome.debugger
      chrome.experimental.debugger.onEvent.addListener(this.onEvent);
      
      // Setup the connection to the devtools backend
      chrome.experimental.debugger.attach(debuggee, version, this.onAttach.bind(this, serial));
      
      // detach if the tab is removed
      chrome.tabs.onRemoved.addListener(this.onRemoved);
    },
    
    sendCommand: function(method, serial, debuggee, params) {
      if (!this._checkDebuggee(debuggee)) {
        return;
      }
      
      chrome.experimental.debugger.sendCommand(
        { tabId: debuggee.tabId },
        method,
        params,
        this.onResponse.bind(this, serial, {method: method, params:params})
      );
    },
  
    detach: function(serial, debuggee) {
      if (!this._checkDebuggee(debuggee)) {
        return; 
      }
      chrome.experimental.debugger.onEvent.removeListener(this.onEvent);    
    
      chrome.experimental.debugger.detach({tabId: debuggee.tabId}, this.noErrorPosted);
      var index = this.debuggeeTabIds.indexOf(debuggee.tabId);
      if (index > -1) {
        this.debuggeeTabIds.splice(index, 1);
      } else {
        console.error("DebuggerAdapter detach ERROR, no such debuggee tabId "+debuggee.tabId);
      }
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
      this.chromeWrappers.detach.apply(this, [undefined, {tabId: tabId}]);
    } // else not ours
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
    this.onRemoved = this.onRemoved.bind(this);
  },
  
  _buildAPI: function(remote) {
    this.api = Object.keys(this.chromeWrappers);
    var domains = Object.keys(remote.api);
    domains.forEach(function(domain) {
      var methods = Object.keys(remote.api[domain]);
      methods.forEach(function(method) {
        var command = domain+'.'+method;
        this.api.push(command);
        this.chromeWrappers[command] = this.chromeWrappers.sendCommand.bind(this, command);
      }.bind(this));
    }.bind(this));
    return this.api;
  }
};

  return DebuggerAdapter;
}

