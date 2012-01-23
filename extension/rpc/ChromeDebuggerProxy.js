// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global define console */

define(  ['crx2app/lib/MetaObject', 'crx2app/lib/q/q', 'crx2app/rpc/JSONMarshall', 'crx2app/rpc/chromeDebuggerRemote', 'crx2app/rpc/chrome'], 
  function(MetaObject, Q, JSONMarshall, remote, chrome) {
  
  
  // See ChromeProxy for methods that return this object.
  var ChromeDebuggerProxy = MetaObject.extend(JSONMarshall, {
  
    // implement the remote commands as RPC over using chromeProxy
    initialize: function(chromeProxy, debuggee) {
      this._debuggee = debuggee; // see http://code.google.com/chrome/extensions/debugger.html
             // We prefix the argument list with our 'debuggee' object containing the tabId
      this.build2LevelPromisingCalls(remote, this, chromeProxy, this._debuggee);
    },

    registerHandlers: function(chromeProxy, eventHandlers) {
      chromeProxy.build2LevelEventHandlers(remote, eventHandlers);
    },
    
    _detach: function(chromeProxy) {
      JSONMarshall._detach.apply(this, [chromeProxy.getConnection()]);
    }
  
  });
  //---------------------------------------------------------------------------------------------
  
  return ChromeDebuggerProxy;
});