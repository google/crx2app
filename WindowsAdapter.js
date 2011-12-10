// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global console */

/*
 Barrier proxy for chrome.windows. One per Debugger domain.
 
 This object has two jobs:
   1) proxy chrome.windows functions,
   2) insure that calls from the Web side only operate on windows
      created from the Web side of the crx2app channel
 
 Debugger access to windows is limited to same-domain.
 */


var makeWindowsAdapter = function(chrome, PostSource) {

function WindowsAdapter(origin) {
  this.debuggerOrigin = origin; // the debugger we accept connections from
  this.instanceIndex = ++WindowsAdapter.instanceCounter;
  this.name = WindowsAdapter.path + '.' + WindowsAdapter.instanceCounter;
  this.chromeWindowIds = [];  // only these ids can be used by client
  this.chromeTabIds = [];
  this._bindListeners();
  // chrome.window functions available to client WebApps
  this.api = ['create', 'getAll'];
}

WindowsAdapter.path = 'chrome.windows';
;
WindowsAdapter.instanceCounter = 0;

WindowsAdapter.prototype = {
  
  // API functions, restricted versions of the chrome.windows functions
  
  create: function(createData) {
    var cleanCreateData = this._cleanseCreateData(createData);
    chrome.windows.create(cleanCreateData, this.onCreated);
  },
  
  getAll: function(getInfo) {
    chrome.windows.getAll(getInfo, this.onGetAll);
  },

  //------------------------------------------------------------------------------------ 

  isAccessibleTab: function(tabId) {
    return (this.chromeTabIds.indexOf(tabId) > -1);
  },
  //------------------------------------------------------------------------------------ 
  // callback from chrome.windows.create
  // @param http://code.google.com/chrome/extensions/dev/windows.html#type-Window
  onCreated: function(win) {
    if (!win) {
      return; // incognito!
    }
    console.assert( !win.tabs || (win.tabs.length === 1), "A newly created chrome.Window should have at most one tab");
    this.chromeWindowIds.push(win.id); // index in this array is our new id
    if (!this.listening) {
      chrome.windows.onRemoved.addListener(this.onRemoved);
      this.listening = true;
    }
    this.postMessage({source:this.getPath(), method:'onCreated', params:[win]});
  },

  // callback from onRemoved, clean up and event the client
  onRemoved: function(windowId) {
    var index = this.chromeWindowIds.indexOf(windowId);
    if (index > -1) {
      this.chromeWindowIds.splice(index, 1);
      this.postMessage({source:this.getPath(), method:'onRemoved'});
    }
  },

  // callback from getAll, convert result to subset visible to client
  onGetAll: function(chromeWindows) {
    var cleanWindows = [];
    chromeWindows.forEach(function(win) {
      var index = this.chromeWindowIds.indexOf(win.id);
      if (index > -1) {
        cleanWindows.push(win);
      } // else not one we track
    });
    this.postMessage({source:this.getPath(), method:'onGetAll', params:cleanWindows});
  },

  //---------------------------------------------------------------------------------------------------------

  // copy allowed fields, force values on others
  _cleanseCreateData: function(createData) {
    return {
      url: createData.url,
      left: createData.left,
      top: createData.top,
      width: createData.width,
      height: createData.height,
      focused: createData.focused,
      type: createData.type,
      incognito: false // true   // Forced 
    };
  },

  _bindListeners: function() {
    this.onCreated.bind(this);
    this.onRemoved.bind(this);
    this.onGetAll.bind(this);
  }
};

  var postSource = new PostSource(WindowsAdapter.path);
  Object.keys(postSource).forEach(function(key) {
    WindowsAdapter.prototype[key] = postSource[key];   
  });

  return WindowsAdapter;
};