// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com




var config = {
  VERSION: '1',
  PROXY_NAME: 'crx2AppProxy',
  EXTN_EVENT_NAME: 'crxDataReady',    // The App listens for this event type
  DATA_PREFIX: 'data-crx',            // The App gets/sets this attribute 
  APP_EVENT_NAME: 'crxAppDataReady',  // The App raises this event type
  WindowsAdapter: makeWindowsAdapter(chrome, PostSource),
  TabsAdapter: makeTabsAdapter(chrome, PostSource),
  DebuggerAdapter: makeDebuggerAdapter(chrome, PostSource)
};

