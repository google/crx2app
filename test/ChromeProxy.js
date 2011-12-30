// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global define console */
define(  ['crx2app/lib/MetaObject', 'crx2app/lib/q/q', 'crx2app/rpc/JSONMarshall', 'crx2app/rpc/chrome'],
function(      MetaObject,         Q,          JSONMarshall,          chrome) {

  var ChromeProxy = MetaObject.extend(JSONMarshall, {
    initialize: function(connection, eventHandlers) {
      this.connection = connection;
    
      this.windows = eventHandlers;
      this.buildEventHandlers(chrome.windows.events, this.windows);
      this.buildPromisingCalls(chrome.windows, this.windows, connection);

      this.tabs = {};
      this.buildPromisingCalls(chrome.tabs, this.tabs, connection);
    
      this.debugger = {};
      this.buildPromisingCalls(chrome.debugger, this.debugger, connection);
    },
  
    getConnection: function(connection) {
      return this.connection;
    }
  });
  
  return ChromeProxy;
});