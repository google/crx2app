// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global console */

var makeTabsAdapter = function(chrome, PostSource) {

function TabsAdapter(windowsAdapter) {
  this.windowsAdapter = windowsAdapter; // the adapter for our chrome.window
  this.port = windowsAdapter.port;
  this._bindListeners();
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
    var index = this.windowsAdapter.chromeWindowIds.indexOf(chromeTab.windowId);
    if (index > -1) {
      this.windowsAdapter.chromeTabIds.push(chromeTab.id);
      this.postMessage({source:this.getPath(), method: 'onCreated', params: [chromeTab]});
    } // else not for us
  },
  
  
  onRemoved: function(tabId, removeInfo) {
    var index = this.windowsAdapter.chromeTabIds.indexOf(tabId);
    if (index > -1) {
      this.windowsAdapter.chromeTabIds.splice(index, 1);
      this.postMessage({source: this.getPath(), method: 'onRemoved', params:[index, removeInfo]});
    } // else not ours
  },
  
  //---------------------------------------------------------------------------------------------------------
  
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
    this.onCreated.bind(this);
    this.onRemoved.bind(this);
  }
};

  var postSource = new PostSource(TabsAdapter.path);
  Object.keys(postSource).forEach(function(key) {
    TabsAdapter.prototype[key] = postSource[key];   
  });

  return TabsAdapter;
};