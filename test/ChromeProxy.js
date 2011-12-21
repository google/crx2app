// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global define console */
define(  ['lib/q/q', '../rpc/JSONMarshall', '../rpc/chrome'],
function(        Q,          JSONMarshall,          chrome) {

  var ChromeProxy = function(connection, eventHandlers) {
    this.connection = connection;
    this.getConnection = function(connection) {
      return this.connection;
    };
    
    this.responseHandlers = eventHandlers;
    
    this.windows = {};
    this.jsonHandlers = this.getEventHandlers(chrome.windows, this.windows);
    this.buildPromisingCalls(chrome.windows, this.windows, connection);

    this.tabs = {};
    this.buildPromisingCalls(chrome.tabs, this.tabs, connection);
    
    this.debugger = {};
    this.buildPromisingCalls(chrome.debugger, this.debugger, connection);

  };
  
  ChromeProxy.prototype = JSONMarshall;
  
  return ChromeProxy;
});