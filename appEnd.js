// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global window document */

// Call after document.body is valid
// @param onMessage: function of message called when extn has data
// @return: function of message, call when you have data

function getChromeExtensionPipe(onMessage){

  var appEnd = {
    VERSION: '1',
    EXTN_EVENT_NAME: 'crxDataReady',   // The App listens for this event type
    DATA_PREFIX: 'data-crx',           // The App gets/sets this attribute 
    APP_EVENT_NAME: 'crxAppDataReady', // The App raises this event type

    onLoad: function() {
      window.removeEventListener('load', this.onLoad, false);
      this.attach();
    },
    
    attach: function() {
      this.elt = document.body;
      
      // prepare for incoming data
      this.elt.addEventListener(this.EXTN_EVENT_NAME, this.fromChromeExtension, false);
      
      // prepare to send outgoing data
      this.event = document.createEvent('Event');
      this.event.initEvent(this.APP_EVENT_NAME, true, true);
    
      // close over the object
      return function(jsonObj) {
        var msg = JSON.stringify(jsonObj);
        // The element and event are constant, only the msg changes
        appEnd.elt.setAttribute(appEnd.DATA_PREFIX, msg);
        appEnd.elt.dispatchEvent(appEnd.event);
        console.log("appEnd dispatch ", appEnd.event);
      };
    },
    
    fromChromeExtension: function(event) {
      var data = this.elt.getAttribute(this.DATA_PREFIX);
      onMessage(data);
    },
    
    _bindListeners: function() {
      this.fromChromeExtension = this.fromChromeExtension.bind(this);
    }
  };
  
  appEnd._bindListeners();
  
  return appEnd;
}