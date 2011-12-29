// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global define console */

define(  ['lib/MetaObject', 'lib/q/q', '../rpc/JSONMarshall', '../rpc/remote', '../rpc/chrome'], 
  function(MetaObject, Q, JSONMarshall, remote) {
  
  var ScriptDebuggerProxy = MetaObject.extend(JSONMarshall, {
  
    initialize: function(eventHandlers) {
      this.remote = eventHandlers;
      this.buildEventHandlers(this.flattenDomains(remote.events), this.flattenDomains(this.remote));
    },

    promiseAttach: function(tabId, chromeProxy) {
      this._debuggee = {tabId: tabId};  // see http://code.google.com/chrome/extensions/debugger.html
      this._chromeProxy = chromeProxy;
       // We prefix the argument list with our 'debuggee' object containing the tabId
      this.build2LevelPromisingCalls(remote, this.remote, this._chromeProxy.getConnection(), [this._debuggee]);
      var promiseAttached = this._chromeProxy.debugger.attach(this._debuggee, remote.version);
      return Q.when(promiseAttached, function(promiseAttached) {
        this.attached = true;
      }.bind(this));
    },
  
    /*
     * create debugger for url in a new Chrome window 
     * @param url, string URL
     * @param chromeProxy, object representing "chrome" extension API
     * @return promise for ScriptDebuggerProxy  
     */
    openInDebug: function(url, chromeProxy) {
      var deferred = Q.defer();
      var jsDebugger = this;
      chromeProxy.windows.create({},  function onCreated(win) {
      
        console.log("ScriptDebuggerProxy openInDebug onCreated callback, trying connect", win);
        var tabId = win.tabs[0].id;
      
        var connected = jsDebugger.promiseAttach(tabId, chromeProxy);
      
        Q.when(connected, function(connected) {
          console.log("ScriptDebuggerProxy openInDebug connected, send enable", connected);

          var enabled = jsDebugger.remote.Debugger.enable();
    
          Q.when(enabled, function(enabled) {          
            console.log("ScriptDebuggerProxy openInDebug enabled", enabled);

            chromeProxy.tabs.update(tabId, {url: url}, function(tab) {
              return deferred.resolve(jsDebugger);
            });
          }).end();
        }).end();
      
      });
      return deferred.promise;
    }
  });
  
  //---------------------------------------------------------------------------------------------
  
  return ScriptDebuggerProxy;
});