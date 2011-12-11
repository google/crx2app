// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global chrome console */

// Call after document.body is valid
// @param onMessage: function of message called when extn has data
// @return: function of message, call when you have data

function getChromeExtensionPipe(callback){

  var appEnd = {

    // Announce to the extn that we are running after we were injected,
    // ask the extn to give us a port name unique to this contentScript
    attach: function() {
      var request = {
        name:    getChromeExtensionPipe.NAME, 
        version: getChromeExtensionPipe.VERSION
      };
      chrome.extension.sendRequest(request, this.onAttach);
    },

    // Get the assigned name of the port and connect to it
    //
    onAttach: function(response) {
      if (!response.name) {
        console.error("crx2App the extension must send .name in response", response);
      }
    
      this.name = response.name;
      
      // open a long-lived connection using the assigned name
      this.port = chrome.extension.connect({name: this.name});
    
      // prepare for extension messages to content-script for app
      this.port.onMessage.addListener(this.fromExtnToApp);
      
      // signal the app that we are ready
      callback();
    },

    addListener: function(listener) {
      this.listener = listener; // may be null
    },
    
    fromExtnToApp: function(msgObj) {
      if (this.listener) {
        this.listener(msgObj);
      } // else no listener
    },

    fromAppToExtn: function(msgObj) {
      this.port.postMessage(msgObj);
    },
    
    _bindListeners: function() {
      this.onAttach = this.onAttach.bind(this);
      this.fromExtnToApp = this.fromExtnToApp.bind(this);
      this.fromAppToExtn = this.fromAppToExtn.bind(this);
      this.addListener = this.addListener.bind(this);
    }
  };
  
  appEnd._bindListeners();
  appEnd.attach();
  
  return {  // these functions are bound to appEnd, not the return object
    postMessage: appEnd.fromAppToExtn,
    addListener: appEnd.addListener
  };
}

getChromeExtensionPipe.NAME = 'crx2app';
getChromeExtensionPipe.VERSION = '1';

