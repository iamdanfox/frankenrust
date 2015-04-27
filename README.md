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

I skim the wiki page on [Differences of JavaScript contexts][https://github.com/nwjs/nw.js/wiki/Differences-of-JavaScript-contexts].  Strange that React isn't working under nw.js's node context. Nevermind, we'll stick to browser dev.  Lightly tweaking an example from from the React homepage, `index.html` now looks like:

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




