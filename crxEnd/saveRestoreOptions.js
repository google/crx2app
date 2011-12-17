// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*globals document window */

// used by options.html and crxEnd.js 
// options.origins is array of origin strings

function saveOptions() {
  var options = {origins: []};
  var originsTable = document.getElementById('origins');
  var originElts = originsTable.getElementsByClassName('origin');
  for(var i = 0; i < originElts.length; i++) {
    var originElt = originElts[i];
    var origin = originElt.value;
    if (origin) {
      options.origins.push(origin);
    }
  }
  var stringified = JSON.stringify(options);
  window.localStorage.setItem('options', stringified);
}

function restoreOptions() {
  var stringified = window.localStorage.getItem('options');
  try {
    var options = JSON.parse(stringified);
    return options;
  } catch (exc) {
    // ignore corrupt data
  }
}