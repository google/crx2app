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
      
      this.debugger = {}; 
      this.buildPromisingCalls(chrome.debugger, this.debugger, connection);
      
      this.debug = false;
    },
  
    getConnection: function(connection) {
      return this.connection;
    },
    
    
    detach: function() {
      JSONMarshall.detach.apply(this, [this.getConnection()]);
    },
  
  
    promiseNewWindow: function() {
      var deferred = Q.defer();      
      //********** workaround for http://code.google.com/p/chromium/issues/detail?id=108519
      var extensionDomain = "chrome-extension://bbjpappmojnmallpnfgfkjmjnhhplgog";
      var fakeBlankURL = extensionDomain+"/workaroundBug108519.html";
      //**********
      this.windows.create({url: fakeBlankURL},  function onCreated(win) {
        deferred.resolve(win);
      });
      return deferred.promise;
    },
    
    /*
     * create debugger for url in a new Chrome window 
     * @param url, string URL
     * @param chromeProxy, object representing "chrome" extension API
     * @return promise for ChromeDebuggerProxy  
     */
    openDebuggerProxy: function(url, debuggerEventHandlers) {
      var deferred = Q.defer();
      var win = this.promiseNewWindow();
      Q.when(win, function(win) {
        if (this.debug) {
          console.log("ChromeProxy openDebuggerProxy onCreated callback, trying connect", win);
        }
        var tabId = win.tabs[0].id;
      
        var debuggerProxy = ChromeDebuggerProxy.new(this, {tabId: tabId});
        debuggerProxy.registerHandlers(this, debuggerEventHandlers);
        
        this.debugger.attach({tabId: tabId}, "0.1", function() {
          if (this.debug) {
            console.log("ChromeProxy openDebuggerProxy connected, send enable: "+tabId);
          }

          var enabled = debuggerProxy.Debugger.enable();
    
          Q.when(enabled, function(enabled) {
            if (this.debug) {
              console.log("ChromeProxy openDebuggerProxy enabled", enabled);
            }

            this.tabs.update(tabId, {url: url}, function(tab) {
              return deferred.resolve(debuggerProxy);
            });
          }.bind(this)).end();
        }.bind(this));
      
      }.bind(this));
      return deferred.promise;
    }
  });
  
  return ChromeProxy;
});