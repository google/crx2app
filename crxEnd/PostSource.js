// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global chrome console*/

function PostSource(path) {
  return {
    setPort: function(port) {
      this.port = port; // see crxEnd
    },
    
    getPath: function() {
      return path;
    },

    postMessage: function(msgObj) {
      if (this.port) {
        console.log("PostSource.postMessage "+this.port.name, msgObj);
        this.port.postMessage(msgObj);
      } // else our port is not open
    },  
  
    postError: function(msg, jsonObj) {
      var errorData = {source: this.path, method: 'onError', params: [msg]};
      if(jsonObj) {
         errorData.params = errorData.params.concat(jsonObj);
        if (jsonObj.serial) { // then we have an error in a response
          errorData.serial = jsonObj.serial;
        }
      }
      this.postMessage(errorData);
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