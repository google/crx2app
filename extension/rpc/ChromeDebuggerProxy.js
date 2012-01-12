// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global define console */

define(  ['crx2app/lib/MetaObject', 'crx2app/lib/q/q', 'crx2app/rpc/JSONMarshall', 'crx2app/rpc/remote', 'crx2app/rpc/chrome'], 
  function(MetaObject, Q, JSONMarshall, remote, chrome) {
  
  var ChromeDebuggerProxy = MetaObject.extend(JSONMarshall, {
  
    initialize: function(chromeProxy, debuggee, eventHandlers) {
      this._debuggee = debuggee; // see http://code.google.com/chrome/extensions/debugger.html
      this.buildEventHandlers(this.flattenDomains(remote.events), 'chrome.debugger', this.flattenDomains(eventHandlers));
             // We prefix the argument list with our 'debuggee' object containing the tabId
      this.build2LevelPromisingCalls(remote, this, chromeProxy, this._debuggee);
    },

    // See ChromeProxy for methods that return this object.
    
    _detach: function(chromeProxy) {
      JSONMarshall._detach.apply(this, [chromeProxy.getConnection()]);
    }
  
  });
  //---------------------------------------------------------------------------------------------
  
  return ChromeDebuggerProxy;
});