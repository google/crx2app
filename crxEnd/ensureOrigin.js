// ftp://ftp.rfc-editor.org/in-notes/rfc3986.txt Appendix B
var reURIString = "^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?";
var reURI = new RegExp(reURIString);

// The Web Origin Concept RFC 6454
// 

function ensureOrigin(maybeOrigin) {
  var origin = "";
  
  var m = reURI.exec(maybeOrigin);
  if (m) {
    var scheme = m[2];
    var authority = m[4];
    
    if (scheme) {
      origin += scheme;
      origin += ":";
    }
    if (authority) {
      origin += "//";
      origin += authority;
    }
  } // else malformed
  
  return origin;
}