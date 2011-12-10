// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global chrome document window console*/

/*
  Sends string messages from extension background process to application window.
  
  Load this content script in the app window using
  http://code.google.com/chrome/extensions/dev/content_scripts.html

  In the matching iframe/window listen for EXTN_EVENT_NAME and then
  grab the content of document.body['data-crx']. To call extension, set 
  the attrbitute and raise event APP_EVENT_NAME.
  
  See appEnd.js for example code.
  
  From extension to content-script
  http://code.google.com/chrome/extensions/messaging.html#connect
  Frome content-script to app
  http://code.google.com/chrome/extensions/content_scripts.html#host-page-communication
*/

var contentScriptProxy = {
    
  VERSION: '1',
  PROXY_NAME: 'crx2AppProxy',
  EXTN_EVENT_NAME: 'crxDataReady',   // The App listens for this event type
  DATA_PREFIX: 'data-crx',           // The App gets/sets this attribute 
  APP_EVENT_NAME: 'crxAppDataReady', // The App raises this event type
  
  // Once the App page has loaded we can attach
  onLoad: function() {
    console.log("contentScriptProxy.js onload");
    window.removeEventListener('load', this.onLoad, false);
    this.attach();
  },
  
  // Announce to the extn that we are running after we were injected,
  // ask the extn to give us a port name unique to this contentScript
  attach: function() {
    var request = {name:this.PROXY_NAME, version: this.VERSION};
    chrome.extension.sendRequest(request, this.handleAttachResponse);
  },
  
  _bindHandlers: function() {
    this.onLoad = this.onLoad.bind(this);
    this.handleAttachResponse = this.handleAttachResponse.bind(this);
    this.fromDOMToExtn = this.fromDOMToExtn.bind(this);
    this.fromExtnToDOM = this.fromExtnToDOM.bind(this);
  },
  
  _initialize: function(givenName) {
    this.name = givenName;
    this.elt = document.body;
    this.dataName = this.DATA_PREFIX;  // first message stored at 'well-known' name
    // http://www.w3.org/TR/2007/WD-DOM-Level-3-Events-20071221/events.html#Events-flow
    this.event = document.createEvent('Event');
    this.event.initEvent(this.EXTN_EVENT_NAME, true, true);  
  },
    
  // Get the assigned name of the port and connect to it
  //
  handleAttachResponse: function(response) {
    if (!response.name) {
      console.error("crx2AppProxy the extension must send .name in response", response);
    }
    
    this._initialize(response.name);
    
    // prepare for app messages to content-script for extn
    this.elt.addEventListener(this.APP_EVENT_NAME, this.fromDOMToExtn, false); 
    
    // open a long-lived connection using the assigned name
    this.port = chrome.extension.connect({name: this.name});
    
    // prepare for extension messages to content-script for app
    this.port.onMessage.addListener(this.fromExtnToDOM);
  },
  
  // Forward the Extn message to the App over the DOM
  fromExtnToDOM: function(msg) {
    this.elt.setAttribute(this.dataName, msg);
    this.elt.dispatchEvent(this.event);
  },
  
  // Forward the App message to Extn from the DOM
  fromDOMToExtn: function(event) {
          console.log("contentScriptProxy event recv ", event);
    var data = this.elt.getAttribute(this.dataName);
    // data is a JSON string 
    this.port.postMessage(data);
  }
};

contentScriptProxy._bindHandlers();
window.addEventListener('load', contentScriptProxy.onLoad, false);
contentScriptProxy.onLoad();
console.log("contentScriptProxy.js ends");