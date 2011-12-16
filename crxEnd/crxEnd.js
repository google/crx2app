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
  
  detach: function() {
    chrome.extension.onRequest.removerListener(this.onRequest);
    this.adapterFactory['chrome.tabs']._disconnect();
  },
  
  getWindowsAdaptersByOrigin: function(origin) {
    var windowsAdapter;
    Object.keys(this.windowsAdaptersByName).forEach(function(name) {
      if (this.windowsAdaptersByName[name].origin === origin) {
        windowsAdapter = this.windowsAdaptersByName[name];
      }
    }, this);
    
    if (!windowsAdapter) {  // then we need to create one for this origin
      this.chromeAdapters = this.adapterFactory(origin);
      windowsAdapter = this.chromeAdapters['chrome.windows'];
      this.windowsAdaptersByName[windowsAdapter.name] = windowsAdapter;
    } else {                
      // we can reuse the existing adapter
      delete this.windowsAdaptersByName[windowsAdapter.name]; // after disassociating it from our list,
      windowsAdapter.port.disconnect();                       // disconnecting the channel,
      windowsAdapter.setPort(null);                           // and clearing its state
    }
    return windowsAdapter;
  },
  
  // introduction callback from content script
  onRequest: function(request, sender, sendResponse) {
    // Do I know you?
    if (sender.tab && request.name === getChromeExtensionPipe.NAME) {
      
      var origin = this.getOrigin(sender.tab.url);
      var windowsAdapter = this.getWindowsAdaptersByOrigin(origin);
      
      // prepare for connection
      if ( !chrome.extension.onConnect.hasListener(this.onConnect) ) {
        chrome.extension.onConnect.addListener(this.onConnect);
      }
      
      // give the proxy it's name, ending our introduction
      sendResponse({name: windowsAdapter.name});
      
    } else {
      sendResponse(undefined);
    }
  },
  
  // When the app connects its port has the name we gave it.
  onConnect: function(port) {
    console.log("crxEnd onConnect "+port.name);
    var windowsAdapter = this.windowsAdaptersByName[port.name];
    if (windowsAdapter) {
      windowsAdapter.setPort(port);

      // prepare for message traffic
      windowsAdapter.onMessage = this.onMessage.bind(this, windowsAdapter);
      port.onMessage.addListener(windowsAdapter.onMessage);

      // prepare for unload
      windowsAdapter.onDisconnect = this.onDisconnect.bind(this);
      port.onDisconnect.addListener(windowsAdapter.onDisconnect);
    } else {
      console.error("crx2app/crxEnd: no windowsAdapter for port.name: "+port.name);
    }
  },
  
  // From App 
  onMessage: function(windowsAdapter, jsonObj) {
    console.log("crx2app/crxEnd: onMessage ", jsonObj);
    var target = this.chromeAdapters[jsonObj.target];
    if (target) {
      if ( target.api.indexOf(jsonObj.method) > -1 ) {
        var method = target[jsonObj.method];
        if (jsonObj.params instanceof Array) {
          if (typeof jsonObj.serial === 'number') {
            // send on to chrome
            method.apply(target, [jsonObj.serial].concat(jsonObj.params) );
          } else {
            windowsAdapter.postError("serial \'"+jsonObj.serial+"\' is not a number; "+jsonObj.target+"."+jsonObj.method);
          }
        } else {
          windowsAdapter.postError("params \'"+jsonObj.params+"\' is not an array"+jsonObj.target+"."+jsonObj.method);
        }
      } else {
        windowsAdapter.postError("method \'"+jsonObj.method+"\' is not one of "+jsonObj.target+'.'+target.api.join(',') );
      }
    } else {
      // reply with error
      windowsAdapter.postError("target \'"+jsonObj.target+"\' does not exist");
    }
  },
  
  onDisconnect: function(port) {
    console.log("crxEnd onDisconnected "+port.name, port);
    console.trace("crxEnd onDisconnected "+port.name);
    var windowsAdapter = this.windowsAdaptersByName[port.name];
    if (windowsAdapter) {
      chrome.extension.onConnect.removeListener(this.onConnect);
      windowsAdapter._disconnect();
      delete this.windowsAdaptersByName[port.name];
    } // else not ours
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
    this.onDisconnect = this.onDisconnect.bind(this);
    // onMessage is bound in listener call
  }
};

crxEnd._bindListeners();

return crxEnd;
}