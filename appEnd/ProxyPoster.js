// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*globals window console*/

// http://dev.w3.org/html5/postmsg/  postMessage()  
 

// @param attachment: {attach: function, postMessage: function, addListener: function, detach: function()}
// @param handShake string expected/echoed by otherWindow

function ProxyPoster(attachment) {
  this.attachment = attachment;
  this.otherWindow = window.parent;  // we are in an iframe
  this.targetOrigin = '*';           // we send to any enclosing domain
  this._bindListeners();
}

ProxyPoster.prototype = {

  attach: function() {
    try {
      // prepare for messages from otherWindow
      window.addEventListener('message', this.recvIntroduction, false);
      
      // prepare from messages from chrome
      this.attachment.addListener(this.fromExtnToOther);
      
      // create a handShake from the attachment 
      this.handShake = this.attachment.NAME + " " + this.attachment.VERSION;
      
      // signal other window we are ready
      this.fromExtnToOther(this.handShake);
      
    } catch(exc) {
      console.error(exc);
    }
  },
  
  detach: function() {
    window.removeEventListener('message', this.fromOtherWindow, false);
  },
  
  // up to otherWindow
  fromExtnToOther: function(msgObj) {
    this.otherWindow.postMessage(msgObj, this.targetOrigin);
  },
  
  // first incoming 'message' event
  recvIntroduction: function(event) {
    if ( event.data.indexOf && (event.data.indexOf(this.handShake) === 0) ) {
      this.targetOrigin = event.origin;  // now we can target, rather than broadcast
      window.removeEventListener('message', this.recvIntroduction, false);
      window.addEventListener('message', this.fromOtherWindow, false);
    } else {
       return; // not for us
    }
  },

  // incoming 'message' event
  fromOtherWindow: function(event) {
    this.attachment.postMessage(event.data);
  },
  
  // call once per instance only
  _bindListeners: function() {
    this.fromOtherWindow = this.fromOtherWindow.bind(this);
    this.fromExtnToOther = this.fromExtnToOther.bind(this);
    this.recvIntroduction = this.recvIntroduction.bind(this);
  }
};
