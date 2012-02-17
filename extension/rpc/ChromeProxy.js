// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global define console */
define(  ['crx2app/lib/MetaObject', 'crx2app/lib/q/q', 'crx2app/rpc/JSONMarshall', 'crx2app/rpc/chrome',  'crx2app/rpc/ChromeDebuggerProxy'],
function(              MetaObject,                 Q,               JSONMarshall,               chrome,                ChromeDebuggerProxy) {

  var ChromeProxy = MetaObject.extend(JSONMarshall, {
    
    initialize: function(connection, eventHandlers) {
      this.connection = connection;
    
      this.windows = eventHandlers.windows || {};
      this.buildEventHandlers(chrome.windows.events, 'chrome.windows', this.windows);
      this.buildPromisingCalls(chrome.windows, this.windows, connection);

      this.tabs = eventHandlers.tabs || {};
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
    
    onPreAttach: function(debuggerEventHandlers, debuggerProxy) {
      debuggerProxy.registerHandlers(debuggerEventHandlers);
    },
    
    onPostAttach: function(debuggerProxy) {
       return debuggerProxy.Debugger.enable();
    },
    
    openDebuggerProxyOnTab: function (tabId, onPreAttach, onPostAttach) {
      var deferred = Q.defer();
      var debuggerProxy = ChromeDebuggerProxy.new(this, {tabId: tabId});
      
      onPreAttach = onPreAttach || this.onPreAttach;
      onPreAttach(debuggerProxy);
       
      function onAttach() {
        if (this.debug) {
          console.log("ChromeProxy openDebuggerProxy connected, send enable: "+tabId);
        }

        onPostAttach = onPostAttach || this.onPostAttach;
        var enabled = onPostAttach(debuggerProxy);
        enabled.then(function () {
          if (this.debug) {
                console.log("ChromeProxy openDebuggerProxy enabled", enabled);
          }
          deferred.resolve(debuggerProxy);
        });
      }

      function onRetry() {
        this.debugger.attach({tabId: tabId}, "1.0", onAttach.bind(this));
      }
      
      this.debugger.attach({tabId: tabId}, "0.1", onAttach.bind(this), onRetry.bind(this));

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
      win.then(
        function(win) {
          if (this.debug) {
            console.log("ChromeProxy openDebuggerProxy onCreated callback, trying connect", win);
          }
          var tabId = win.tabs[0].id;
      
          
          var debuggerProxy = this.openDebuggerProxyOnTab(tabId, this.onPreAttach.bind(this, debuggerEventHandlers));
          debuggerProxy.then(
            function(debuggerProxy) {
              this.tabs.update(tabId, {url: url}, function(tab) {
                return deferred.resolve(debuggerProxy);
              });
            }.bind(this)
          ).end();
          
        }.bind(this));
      
      return deferred.promise;
    }
  });
  
  return ChromeProxy;
});