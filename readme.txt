crx2app A Barrier Proxy giving Web app limited access to Chrome Browser extensions.

// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

Install
  One of these two:
    A) start chrome browser on the command line with --enable-experimental-extension-apis
     OR
    B) use URL chrome://flags/, find "Experimental Extension APIs", enable, restart
  
  Clone this reprository
  
  Use URL chrome://extensions, 
    set developer mode, 
    load unpacked extension, 
    navigate to the clone,
    find the subdirectory /extension
    open it to select this folder as the unpacked extension
    ==> the crx2app extension should be loaded
    
Test page
      
  Open chrome://extensions 
    Find extension "crx2app"
    Click "options" link, 
      ==> You should see a yellow page
    add the URL (origin part) of your web server
  Open test/index.html in chrome.
  
Using Orion
  If you are using Orion, your clone will have a URL like 
    http://orionhub.org/edit/edit.html#/file/PQ/test/index.html
    open http://orionhub.org/file/PQ/test/index.html
 
Directories
  crxEnd/ chrome side of proxy, use the chromeIframe.html as serc in your web page
  appEnd/ app side of proxy, include these files in your web page
  rpc/ marshalling/dispatch code for appEnd use
  lib/ q.js and require.js used in rpc/ and demos
  test/ demo app
  