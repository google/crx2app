// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global define console */
define(  ['lib/q/q', '../rpc/JSONMarshall', '../rpc/chrome'],
function(        Q,          JSONMarshall,          chrome) {

  var ChromeProxy = function(connection, eventHandlers) {
    this.responseHandlers = eventHandlers;
    this.windows = {};
    this.jsonHandlers = this.getEventHandlers(chrome.windows, this.windows);
    this.buildPromisingCalls(chrome.windows, this.windows, connection);
  };
  
  ChromeProxy.prototype = JSONMarshall;
  
  return ChromeProxy;
});