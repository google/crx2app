// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*global chrome console*/


// Close over path, but methods will have windowAdapter for |this|
 
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
        if (debugMessages) console.log("PostSource.postMessage "+this.port.name+' '+msgObj.source+"."+msgObj.method, msgObj);
        this.port.postMessage(msgObj);
      } else {// else our port is not open
        console.error("PostSource.postMessage no port for "+path);
      }
    },  
  
    postError: function(msg, jsonObj) {
      var errorData = {source: this.getPath(), method: 'onError', params: [msg]};
      if(jsonObj) {
         errorData.params = errorData.params.concat(jsonObj);
        if (jsonObj.serial) { // then we have an error in a response
          errorData.serial = jsonObj.serial;
        }
      }
      this.postMessage(errorData);
    },
    
    noErrorPosted: function(jsonObj) {
      if (chrome.extension.lastError) {
        this.postError(chrome.extension.lastError, jsonObj);
        return false;
      }
      return true;
    },
    
    // Forward command responses from Chrome to App
    onResponse: function(serial, jsonObj, result) {
      if ( this.noErrorPosted({serial: serial}) ) {
        this.postMessage({source: this.getPath(), serial: serial, method: "OnResponse", params: [result], request: jsonObj});
        return true;
      }
      return false;
    }
  };
}