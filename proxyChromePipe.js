// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global window console */


// @return: connection object with attach/detach addListener/postMessage

function getChromeExtensionPipe(iframeDomain){

  var proxyEnd = {

    // call this method before the iframe can load
    // do not call postMessage until the callback fires.
    attach: function(callback) {
      this.onIntroduction = this.onAttach.bind(this, callback);
      window.addEventListener('message', this.onIntroduction, false);
    },

    detach: function() {
      window.removeEventListener('message', this.fromExtnToApp, false);
    },
    
    // Get the assigned name of the port and connect to it
    //
    onAttach: function(callback, event) {
      if (event.origin === iframeDomain) {
        // Remember our partner
        this.source = event.source; 

        // detach this listener
        window.removeEventListener('message', this.onIntroduction, false);
        
        // rebind the listener to proxying function
        window.addEventListener('message', this.fromExtnToApp, false);
      
        // signal the app that we are ready
        callback();

        // signal the extn that we are ready with echo
        this.fromAppToExtn(event.data); 
      } // else not for us
    },
    
    // Our port closed
    onDisconnect: function() {
      this.fromExtnToApp({source:'crx2app', method: 'onDisconnect', params:[]});
      delete this.listener;
    },

    addListener: function(listener) {
      this.listener = listener; // may be null
    },
    
    fromExtnToApp: function(event) {
      if (this.listener) {
        this.listener(event.data);
      } // else no listener
    },

    fromAppToExtn: function(msgObj) {
      this.source.postMessage(msgObj, iframeDomain);
    },
    
    _bindListeners: function() {
      this.onDisconnect = this.onDisconnect.bind(this);
      this.fromExtnToApp = this.fromExtnToApp.bind(this);
      
      this.attach = this.attach.bind(this);
      this.detach = this.detach.bind(this);
      this.fromAppToExtn = this.fromAppToExtn.bind(this);
      this.addListener = this.addListener.bind(this);
    }
  };
  
  proxyEnd._bindListeners();
  
  return {  // these functions are bound to proxyEnd, not the return object
    attach: proxyEnd.attach,
    postMessage: proxyEnd.fromAppToExtn,
    addListener: proxyEnd.addListener,
    detach: proxyEnd.detach,
    NAME: getChromeExtensionPipe.NAME,
    VERSION: getChromeExtensionPipe.VERSION
  };
}

getChromeExtensionPipe.NAME = 'crx2app';
getChromeExtensionPipe.VERSION = '1';

