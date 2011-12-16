// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global console */

var makeTabsAdapter = function(chrome, PostSource) {

function TabsAdapter(windowsAdapter) {
  this.windowsAdapter = windowsAdapter; // the adapter for our chrome.window
  windowsAdapter.setTabAdapter(this);   // backpointer for onCreated
  this.port = windowsAdapter.port;
  this._bindListeners();
  
  this.api = ['create', 'update', 'remove'];
  this._connect();
}

TabsAdapter.path = 'chrome.tabs';


TabsAdapter.prototype = {

  create: function(createProperties) {
    var cleanCreateProperties = this._cleanseCreateProperties(createProperties);
    chrome.tabs.create(cleanCreateProperties, this.noErrorPosted);
  },
  
  // NB The debugger will see progress events from the devtools and chrome.extension
  update: function(tabId, updateProperties) {
    var index = this.windowsAdapter.chromeTabIds.indexOf(tabId);
    if (index > -1) {
      chrome.tabs.update(tabId, updateProperties);
    } else {
      var msg = "update got invalid tabId: "+tabId;
      this.postError(msg);
    }
  },
  
  remove: function(indices) {
    if (typeof indices === 'number') {
      indices = [indices];
    }
    var indexToId = this.windowsAdapter.chromeTabIds;
    var chromeIndices = indices.map(function(index) {
      return indexToId[index];
    });
    chrome.tabs.remove(chromeIndices, this.noErrorPosted);
  },
  //---------------------------------------------------------------------------------------------------------
  // Events
  
  onCreated: function(chromeTab) {
    console.log("TabsAdapter onCreated", chromeTab);
    // The barrier for creation is the target window 
    var tabAdapter = this;
    this.windowsAdapter.barrier(chromeTab.windowId, arguments, function(windowId, index) {
      // |this| is windowsAdapter inside of barrier()
      this.chromeTabIds.push(chromeTab.id);
      this.postMessage({source:tabAdapter.getPath(), method: 'onCreated', params: [chromeTab]});
      tabAdapter.putUpInfobar(chromeTab.id);     
    });
  },
  
  putUpInfobar: function(tabId) {
      var details = {tabId: tabId, path: "crxEnd/warnDebugging.html?debuggerDomain="+this.windowsAdapter.debuggerOrigin, height: 24};
      console.log("putUpInfoBar ready", details);
      chrome.experimental.infobars.show(details, function(win){
        console.log("putUpInfobar done", win);
      });
  },
  
  onUpdated: function(tabId, changeInfo, tab) {
    this.barrier(tabId, arguments, function(tabId, changeInfo, tab) {
      this.postMessage({source: this.getPath(), method: 'onUpdated', params:[tabId, changeInfo, tab]});
    });
  },
  
  onRemoved: function(tabId, removeInfo) {
    this.barrier(tabId, arguments, function(tabId, removeInfo, index) {
      this.windowsAdapter.chromeTabIds.splice(index, 1);
      this.postMessage({source: this.getPath(), method: 'onRemoved', params:[tabId, removeInfo]});
    });
  },
  
  //---------------------------------------------------------------------------------------------------------
  // Call the action iff the tab is allowed to the debugger
  // action takes the same arguments as the caller of barrier, plus index is available
  barrier: function (tabId, args, action) {
    var index = this.windowsAdapter.chromeTabIds.indexOf(tabId);
    if (index > -1) {
      var _args = Array.prototype.slice.call(args);
      action.apply( this, _args.concat([index]) );
    } // else not ours
  },
  
  _connect: function() {
    // build a record of the tabs being debugged
    chrome.tabs.onCreated.addListener(this.onCreated);  
    // prepare to update debuggee records
    chrome.windows.onRemoved.addListener(this.onUpdated);
    // prepare to clean up the records
    chrome.tabs.onRemoved.addListener(this.onRemoved);
    // chrome.tabs functions available to client WebApps
  },

  _disconnect: function() {
    chrome.tabs.onCreated.removeListener(this.onCreated);  
    chrome.windows.onRemoved.removeListener(this.onUpdated);
    chrome.tabs.onRemoved.removeListener(this.onRemoved);
  },
  
  _cleanseCreateProperties: function(createProperties) {
    console.assert( (typeof createProperties.id === 'number'), "The createProperties.id must be a number");
    var chromeWindowId = this.windowsAdapter.chromeWindowIds[createProperties.id];
    if (chromeWindowId) {
      return createProperties;
    }
    var msg = "The createProperties.id "+createProperties.id + " is not a valid chrome.window id";
    this.postError(msg);
  },
  
  _bindListeners: function() {
    this.onCreated = this.onCreated.bind(this);
    this.onRemoved = this.onRemoved.bind(this);
    this.onUpdated = this.onUpdated.bind(this);
  }
};

  var postSource = new PostSource(TabsAdapter.path);
  Object.keys(postSource).forEach(function(key) {
    TabsAdapter.prototype[key] = postSource[key];   
  });

  return TabsAdapter;
};