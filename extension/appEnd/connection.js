// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*globals getChromeExtensionPipe define document*/

define(['crx2app/appEnd/proxyChromePipe'], function(chromeExtensionPipe) {

  var iframeDomain = "chrome-extension://bbjpappmojnmallpnfgfkjmjnhhplgog";

  var connection = chromeExtensionPipe.createFrom(iframeDomain);

  // dynamic iframe load
  //
  function loadPlugin(url) {
    var iframe = document.createElement('iframe');
    iframe.setAttribute('src', url);
    var elt = document.body;
    elt.appendChild(iframe);
  }
  
  var unwrappedAttach = connection.attach;
  
  connection.attach = function(callback) {
    // Register the attach callback before we load the chrome iframe
    unwrappedAttach(callback);
    // dynamically load the chromeIframe, it will connect and fire the callback
    // (if we load the iframe statically, 
    // this outer load event will come *after* the iframe load event.)
    loadPlugin(iframeDomain + "/appEnd/chromeIframe.html");
  };
  
  return connection; 

});