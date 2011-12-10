// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global console*/

/*
  Chrome extension end of crx2app communications
  
  This file runs in background.html. It waits for the content-script 
  in contentScriptProxy.js to connect, then ferries requests from 
  app to chrome and responses/events from chrome to app.
  
  The messages from App are multiplexed: {target: string, request: any},
  send to chrome[target], eg chrome.experimental.debugger
  
  The messages to App are multiplexed: {source: string, data: any}
  
 */

function makeCxrEnd(config, chrome) {

var crxEnd = {

  // Entry point, sets up the communication with the content-script
  // @param ChromeAdapterFactories dictionary of target-names to adapters
  //         eg 'chrome.debugger': DebuggerAdapter
  // @param WindowsAdapter: ctor for windowsAdapter represention
  
  attach: function(adapterFactory) {
    this.adapterFactory = adapterFactory;
    this.windowsAdaptersByName = {};
    // prepare for introduction call from content-script
    chrome.extension.onRequest.addListener(this.onRequest);
  },
  
  getWindowsAdaptersByOrigin: function(origin) {
    var windowsAdapter;
    Object.keys(this.windowsAdaptersByName).forEach(function(name) {
      if (this.windowsAdaptersByName[name].origin === origin) {
        windowsAdapter = this.windowsAdaptersByName[name];
      }
    }, this);
    
    if (!windowsAdapter) {
      this.chromeAdapters = this.adapterFactory(origin);
      windowsAdapter = this.chromeAdapters['chrome.windows'];
      this.windowsAdaptersByName[windowsAdapter.name] = windowsAdapter;
    }
    return windowsAdapter;
  },
  
  // introduction callback from content script
  onRequest: function(request, sender, sendResponse) {
    // Do I know you?
    if (sender.tab && request.name === config.PROXY_NAME) {
      
      var origin = this.getOrigin(sender.tab.url);
      var windowsAdapter = this.getWindowsAdaptersByOrigin(origin);
      
      // prepare for connection
      chrome.extension.onConnect.addListener(this.onConnect);
      
      // give the proxy it's name, ending our introduction
      sendResponse({name: windowsAdapter.name});
      
    } else {
      sendResponse(undefined);
    }
  },
  
  // When the content script connects its port has the name we gave it.
  onConnect: function(port) {
    var windowsAdapter = this.windowsAdaptersByName[port.name];
    if (windowsAdapter) {
      windowsAdapter.setPort(port);
      // prepare for message traffic
      port.onMessage.addListener(this.onMessage.bind(this, windowsAdapter));
    } else {
      console.error("crx2app/crxEnd: no windowsAdapter for port.name: "+port.name);
    }
  },
  
  // From App via contentScriptProxy
  onMessage: function(windowsAdapter, msg) {
    console.log("crx2app/crxEnd: onMessage ", msg);
    var jsonObj = JSON.parse(msg);
    var target = this.chromeAdapters[jsonObj.target];
    if (target) {
      if ( target.api.indexOf(jsonObj.method) > -1 ) {
        var method = target[jsonObj.method];
        if (jsonObj.params instanceof Array) {
          // send on to chrome
          method.apply(target, jsonObj.params);
        } else {
          windowsAdapter.postError("params \'"+jsonObj.params+"\' is not an array");
        }
      } else {
        windowsAdapter.postError("method \'"+jsonObj.method+"\' is not one of "+target.api.join(',') );
      }
    } else {
      // reply with error
      windowsAdapter.postError("target \'"+jsonObj.target+"\' does not exist");
    }
  },
  
  getOrigin: function(url) {
    // eg http://www.example.com/path
    //      0  1 2
    var splits = url.split('/');  
    var segments = splits.slice(0, 3);
    return segments.join('/');
  },
  
  // Call exactly once.
  _bindListeners: function() {
    this.onRequest = this.onRequest.bind(this);
    this.onConnect = this.onConnect.bind(this);
    // onMessage is bound in listener call
  }
};

crxEnd._bindListeners();

return crxEnd;
}