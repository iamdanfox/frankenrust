var ffi = require('ffi');

var backend = ffi.Library('./backend/target/debug/libstringtools-33413ce5f47aa5d5.dylib', {
  "simple": [ "int", [] ]
});

module.exports = function() {
  return backend.simple();
}
