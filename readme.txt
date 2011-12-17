crx2app A Barrier Proxy giving Web app limited access to Chrome Browser extensions.

Install
  One of these two:
    start chrome browser on the command line with --enable-experimental-extension-apis
    use URL chrome://flags/, find "Experimental Extension APIs", enable, restart
  clone this reprository
  Use URL chrome://extensions, set developer mode, load unpacked extension, navigate to the clone
    the crx2app extension should be loaded
    
Test page
      
  Use chrome://extensions > crx2app options link, add the URL (origin part) of your web server
  Open test/index.html in chrome.
  
Using Orion
  If you are using Orion, your clone will have a URL like 
    http://orionhub.org/edit/edit.html#/file/PQ/test/index.html
    open http://orionhub.org/file/PQ/test/index.html
 
Directories
  crxEnd/ chrome side of proxy, use the chromeIframe.html as serc in your web page
  appEnd/ app side of proxy, include these files in your web page
  remote/ marshalling/dispatch code for appEnd use
  test/ demo app
  