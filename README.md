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
