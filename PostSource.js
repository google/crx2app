// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global chrome */

function PostSource(path) {
  return {
    setPort: function(port) {
      this.port = port; // see crxEnd
    },
    
    getPath: function() {
      return path;
    },

    postMessage: function(msgObj) {
        this.port.postMessage(msgObj);
    },  
  
    postError: function(msg) {
      this.postMessage({source: this.path, method: 'onError', params: [msg]});
    },
    
    noErrorPosted: function() {
      if (chrome.extension.lastError) {
        this.postError(this.getPath(), chrome.extension.lastError);
        return false;
      }
      return true;
    }
  };
}