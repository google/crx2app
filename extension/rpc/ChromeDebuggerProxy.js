// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global define console */

define(  ['crx2app/lib/MetaObject', 'crx2app/lib/q/q', 'crx2app/rpc/JSONMarshall', 'crx2app/rpc/remote', 'crx2app/rpc/chrome'], 
  function(MetaObject, Q, JSONMarshall, remote, chrome) {
  
  var ChromeDebuggerProxy = MetaObject.extend(JSONMarshall, {
  
    initialize: function(connection, debuggee, eventHandlers) {
      this._debuggee = debuggee; // see http://code.google.com/chrome/extensions/debugger.html
      this.buildEventHandlers(this.flattenDomains(remote.events), 'chrome.debugger', this.flattenDomains(eventHandlers));
      // The chrome.debugger API has a few functions we need to send remote debug commands 
      // http://code.google.com/chrome/extensions/dev/experimental.debugger.html
      this.buildPromisingCalls(chrome.debugger, this, connection, debuggee);
    },

    // See ChromeProxy for methods that return this object.

    promiseAttach: function(chromeProxy) {
       // We prefix the argument list with our 'debuggee' object containing the tabId
      this.build2LevelPromisingCalls(remote, this, chromeProxy.getConnection(), this._debuggee);
      return this.attach(remote.version);
    },
    
    _detach: function(chromeProxy) {
      JSONMarshall._detach.apply(this, [chromeProxy.getConnection()]);
    }
  
  });
  //---------------------------------------------------------------------------------------------
  
  return ChromeDebuggerProxy;
});