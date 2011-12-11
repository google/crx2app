// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global console */

var makeTabsAdapter = function(chrome, PostSource) {

function TabsAdapter(windowsAdapter) {
  this.windowsAdapter = windowsAdapter; // the adapter for our chrome.window
  this.port = windowsAdapter.port;
  this._bindListeners();
  
  // build a record of the tabs being debugged
  chrome.tabs.onCreated.addListener(this.onCreated);  
  // prepare to update debuggee records
  chrome.windows.onRemoved.addListener(this.onUpdated);
  // prepare to clean up the records
  chrome.tabs.onRemoved.addListener(this.onRemoved);
  // chrome.tabs functions available to client WebApps
  this.api = ['create', 'update', 'remove'];
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
    this.barrier(chromeTab.id, arguments, function(tabId, index) {
      this.windowsAdapter.chromeTabIds.push(chromeTab.id);
      this.postMessage({source:this.getPath(), method: 'onCreated', params: [chromeTab]});
      var details = {tabId: tabId, path: "warnDebugging.html&about="+this.windowsAdapter.debuggerOrigin};
      chrome.experimental.infobars.show(details, this.noErrorPosted);
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
      action.apply( this, args.concat([index]) );
    } // else not ours
  },
  
  _watchDebuggerTabs: function(tabId) {
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