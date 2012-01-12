// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global define console */
define(  ['crx2app/lib/MetaObject', 'crx2app/lib/q/q', 'crx2app/rpc/JSONMarshall', 'crx2app/rpc/chrome',  'crx2app/rpc/ChromeDebuggerProxy'],
function(              MetaObject,                 Q,               JSONMarshall,               chrome,                ChromeDebuggerProxy) {

  var ChromeProxy = MetaObject.extend(JSONMarshall, {
  
    initialize: function(connection, eventHandlers) {
      this.connection = connection;
    
      this.windows = eventHandlers.windows;
      this.buildEventHandlers(chrome.windows.events, 'chrome.windows', this.windows);
      this.buildPromisingCalls(chrome.windows, this.windows, connection);

      this.tabs = eventHandlers.tabs;
      this.buildEventHandlers(chrome.tabs.events, 'chrome.tabs', this.tabs);
      this.buildPromisingCalls(chrome.tabs, this.tabs, connection);
    },
  
    getConnection: function(connection) {
      return this.connection;
    },
    
    
    detach: function() {
      JSONMarshall.detach.apply(this, [this.getConnection()]);
    },
  
    /*
     * create debugger for url in a new Chrome window 
     * @param url, string URL
     * @param chromeProxy, object representing "chrome" extension API
     * @return promise for ChromeDebuggerProxy  
     */
    openDebuggerProxy: function(url, debuggerEventHandlers) {
      var deferred = Q.defer();
      this.windows.create({},  function onCreated(win) {
      
        console.log("ChromeProxy openDebuggerProxy onCreated callback, trying connect", win);
        var tabId = win.tabs[0].id;
      
        var debuggerProxy = ChromeDebuggerProxy.new(this.connection, {tabId: tabId}, debuggerEventHandlers);
        var connected = debuggerProxy.promiseAttach(tabId, this);
      
        Q.when(connected, function(connected) {
          console.log("ChromeProxy openDebuggerProxy connected, send enable", connected);

          var enabled = debuggerProxy.Debugger.enable();
    
          Q.when(enabled, function(enabled) {          
            console.log("ChromeProxy openDebuggerProxy enabled", enabled);

            this.tabs.update(tabId, {url: url}, function(tab) {
              return deferred.resolve(debuggerProxy);
            });
          }.bind(this)).end();
        }.bind(this)).end();
      
      }.bind(this));
      return deferred.promise;
    }
  });
  
  return ChromeProxy;
});