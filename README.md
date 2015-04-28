frankenrust
===========

Can we graft a fast, concurrent Rust backend onto a pretty, declarative frontend built with React.js?  Who knows.

The plan is to use nw.js to make a native-looking app with React.

Gettings started with nw.js
---------------------------

Navigate to <nwjs.io> not much of a quickstart there, so I head to the GitHub repo <https://github.com/nwjs/nw.js/>.  Looks like we will need the usual package.json boilerplate. I run `npm init` and hit enter a few times.

    {
      "name": "frankenrust",
      "version": "1.0.0",
      "description": "frankenrust",
      "main": "index.js",
      "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
      },
      "author": "iamdanfox",
      "license": "MIT"
    }

I'm not quite sure how I want to install nw.js itself (binary? brew case?). In the end I find an [npm package](https://www.npmjs.com/package/nw) that looks like it will do the job.

Run `npm install --save nw`. This takes ages because the Oxford wifi is pants.

Following the recommendation from <https://www.npmjs.com/package/nw>, I add a start script to `package.json`:

    "scripts": {
      "start": "nw"
    }

I copy the `index.html` from the nw.js quickstart and update the `package.json` main field to be `index.html`.

    <!DOCTYPE html>
    <html>
      <head>
        <title>Hello World!</title>
      </head>
      <body>
        <h1>Hello World!</h1>
        We are using node.js <script>document.write(process.version)</script>.
      </body>
    </html>

The moment of truth.  I run `npm start` and this beauty appears. Time to commit.

![Hello world screenshot](http://i.imgur.com/PHjvq46.png?1)

React
-----

That browser chrome is a bit of a let-down, I wanted something native looking!

<https://github.com/nwjs/nw.js/wiki/Frameless-window> has some recommendations, so I add the following to package.json

    "window": {
      "toolbar": false
    }

Bingo.  Time to get React involved.

    npm install --save react

Let's try a trivial proof of concept:

    <script>
      var React = require('react')
    </script>

Nope, looks like that was a bit naive.
```
[90357:0427/153208:ERROR:nw_shell.cc(335)] ReferenceError: document is not defined
at Object.<anonymous> (/Users/danfox/frankenrust/node_modules/react/lib/CSSPropertyOperations.js:31:7)
at Module._compile (module.js:451:26)
at Object.Module._extensions..js (module.js:469:10)
at Module.load (module.js:346:32)
at Function.Module._load (module.js:301:12)
at Module.require (module.js:356:17)
at require (module.js:375:17)
at Object.<anonymous> (/Users/danfox/frankenrust/node_modules/react/lib/ReactDOMIDOperations.js:17:29)
at Module._compile (module.js:451:26)
at Object.Module._extensions..js (module.js:469:10)
```
I skim the wiki page on [Differences of JavaScript contexts](https://github.com/nwjs/nw.js/wiki/Differences-of-JavaScript-contexts).  Strange that React isn't working under nw.js's node context. Nevermind, we'll stick to browser dev.  Lightly tweaking an example from from the React homepage, `index.html` now looks like:

    <!DOCTYPE html>
    <html>
      <head>
        <title>Hello World!</title>
      </head>
      <body>
        <script src="./node_modules/react/dist/react.js"></script>
        <script>
        var HelloMessage = React.createClass({displayName: "HelloMessage",
          render: function() {
            return React.createElement("div", null, "Hello ", this.props.name);
          }
        });

        React.render(React.createElement(HelloMessage, {name: "John"}), document.body);
        </script>
      </body>
    </html>

Time for Rust
-------------

My nightly install of Rust looks a little out of date, so let's fix that first:

    curl -s https://static.rust-lang.org/rustup.sh | sudo sh -s -- --channel=nightly

While that's chugging away, we can get the rust boilerplate going.

    cargo new backend
    cd backend

This gives us a nice starting point:

    .
    ├── Cargo.toml
    └── src
        └── lib.rs

    1 directory, 2 files

I want this Rust code to be externally callable, so I consult Google and find <http://siciarz.net/24-days-of-rust-calling-rust-from-other-languages/>.  lib.rs now contains:
```rs
extern crate libc;

use std::c_str::CString;
use libc::c_char;

#[no_mangle]
pub extern "C" fn count_substrings(value: *const c_char, substr: *const c_char) -> i32 {
    let c_value = unsafe { CString::new(value, false) };
    let c_substr = unsafe { CString::new(substr, false) };
    match c_value.as_str() {
        Some(value) => match c_substr.as_str() {
            Some(substr) => value.match_indices(substr).count() as i32,
            None => -1,
        },
        None => -1,
    }
}

#[test]
fn it_works() {
}
```
And Cargo.toml:

    [package]
    name = "backend"
    version = "0.1.0"
    authors = ["Dan Fox <iamdanfox@gmail.com>"]

    [lib]
    name = "stringtools"
    crate-type = ["dylib"]

I run `cargo build` and immediately hit an error:

    Compiling backend v0.1.0 (file:///Users/danfox/frankenrust/backend)
    src/lib.rs:3:5: 3:24 error: unresolved import `std::c_str::CString`. Could not find `c_str` in `std`
    src/lib.rs:3 use std::c_str::CString;
                     ^~~~~~~~~~~~~~~~~~~
    error: aborting due to previous error
    Could not compile `backend`.

    To learn more, run the command again with --verbose.

Since Zbigniew's article was written in Dec 2014 (with pre-beta Rust), I hazard a guess that `std` has changed.  Drastic simplification time:

    #![feature(libc)]

    extern crate libc;

    #[no_mangle]
    pub extern "C" fn simple() -> i32 {
        1234
    }

    #[test]
    fn it_works() {
    }

`cargo build` works perfectly this time.  There are now a bunch of exciting files in the `target` directory:

    .
    └── debug
        ├── build
        ├── deps
        ├── examples
        ├── libstringtools-33413ce5f47aa5d5.dylib
        ├── libstringtools-33413ce5f47aa5d5.dylib.dSYM
        │   └── Contents
        │       ├── Info.plist
        │       └── Resources
        │           └── DWARF
        │               └── libstringtools-33413ce5f47aa5d5.dylib
        └── native

    9 directories, 3 files

To check that dylib actually works, I fire up a python REPL:

    Python 2.7.9 (default, Jan  7 2015, 11:49:12)
    [GCC 4.2.1 Compatible Apple LLVM 6.0 (clang-600.0.56)] on darwin
    Type "help", "copyright", "credits" or "license" for more information.
    >>> import ctypes
    >>> ctypes.CDLL('./target/debug/libstringtools-33413ce5f47aa5d5.dylib').simple()
    1234

Magic.

Calling Rust from Node.js
-------------------------

First things first, we need the [foreign function interface](https://www.npmjs.com/package/ffi) for node:

    npm install --save ffi

Adding a few lines to `index.html` will tell us whether this worked:

    <head>
      <title>Hello World!</title>
      <script>

      var ffi = require('ffi')
      console.log(ffi);

      </script>
    </head>
    ...

Nope, apparently not.
```
[1628:0427/171035:ERROR:nw_shell.cc(335)] Error: Module did not self-register.
    at Error (native)
    at Module.load (module.js:346:32)
    at Function.Module._load (module.js:301:12)
    at Module.require (module.js:356:17)
    at require (module.js:375:17)
    at bindings (/Users/danfox/frankenrust/node_modules/ffi/node_modules/bindings/bindings.js:76:44)
    at Object.<anonymous> (/Users/danfox/frankenrust/node_modules/ffi/node_modules/ref/lib/ref.js:5:47)
    at Module._compile (module.js:451:26)
    at Object.Module._extensions..js (module.js:469:10)
    at Module.load (module.js:346:32)
```
Apparently, the libraries involving native code need to be [compiled specifically](https://github.com/nwjs/nw.js/issues/723) for nw.js.

> The reason these modules needs to be recompiled is that nw.js has a different ABI (Application Binary Interface) than node.js.
> In a normal node.js project, when you run `npm install ffi`, npm downloads the source for ffi and then compiles the C/C++
> specifically for your machine using a tool called `node-gyp`.  In order to make them compatible with nw.js, we have to go
> into the directory and recompile them to target the exact version of nw.js. [[Read more](https://github.com/nwjs/nw.js/wiki/Using-Node-modules#3rd-party-modules-with-cc-addons)]

The tool we need is `nw-gyp`.  Let's give it a shot:

    npm install -g nw-gyp
    cd node_modules/ffi
    nw-gyp configure --target=0.12.1
    nw-gyp build

This looks optimistic so far. Back in the root directory however, `npm start` gives us the same error.  Looking more closely, I noticed that one of the files mentioned was in `/Users/danfox/frankenrust/node_modules/ffi/node_modules/ref/`.  This suggests that `ffi` has a dependency, `ref`, that we also need to recompile with nw-gyp.

    cd ./node_modules/ffi/node_modules/ref
    nw-gyp configure --target=0.12.1
    nw-gyp build

Everything seems to run OK, so back in our root I cross my fingers and run `npm start`. Success!

To actually use this lovely foreign function interface, javascript needs to know the type signatures
of any Rust code we are calling.  The [Node FFI Tutorial](https://github.com/node-ffi/node-ffi/wiki/Node-FFI-Tutorial) has a nice little example, so I adjusted `index.html` to now look like this:

    <!DOCTYPE html>
    <html>
      <head>
        <title>Hello World!</title>
        <script>

        var backend = require('ffi').Library('./backend/target/debug/libstringtools-33413ce5f47aa5d5.dylib', {
          "simple": [ "int", [] ]
        });
        console.log("Rust called from JS: " + backend.simple());

        </script>
      </head>
      <body>
        <script src="./node_modules/react/dist/react.js"></script>
        <script>
        var HelloMessage = React.createClass({displayName: "HelloMessage",
          render: function() {
            return React.createElement("div", null, "Hello ", this.props.name);
          }
        });

        React.render(React.createElement(HelloMessage, {name: "John"}), document.body);
        </script>
      </body>
    </html>

It works perfectly!

Some Housekeeping
-----------------

That thing about React not working in a node.js context annoyed me, so I did some more Googling.  It turns out
that nw.js's `window.document` object isn't accessible as a global `document`.  Something in React is calling this, so it's trivial to remedy this:

```js
global.document = window.document;
global.navigator = window.navigator; // React also needs the `navigator` object
```

Also, for a decent-sized React app, I really want to be able to write components in JSX rather than longhand javascript.  The `node-jsx` module looks decent.  It seems quite slow, but will do for development purposes!

Debugging nw.js
---------------

So far, debugging has been limited to `console.log` in the terminal and Ctrl-C-ing to restart things.  nw.js actually supports a remote Chrome Inspector using the `--remote--debuggin-port` flag.  Running `npm run debug` and then navigating to <http://localhost:9222> sets up a whole beautiful inspector.

[Inspector screenshot](http://i.imgur.com/ZJbMK5C.png)
