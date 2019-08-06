# minidocs

[![NPM version][npm-image]][npm-url]
[![js-standard-style][standard-image]][standard-url]

> build a minimalist site for your documentation

This module generates a documentation site from two simple components: 

1. A collection of markdown documents
2. A hierarchical object specifying your table of contents

This module is intentionally simpler and more opinionated than something like [Jekyll](https://jekyllrb.com/) or [Sphinx](http://www.sphinx-doc.org/en/stable/). Depending on what you're looking for, that might be good, because it's easier to reason about, or bad, because it's less flexible! It'll probably be most useful if your documentation already consists entirely of markdown files, and it composes well with any tools that generate markdown, for example [`ecosystem-docs`](https://github.com/hughsk/ecosystem-docs), which pulls README files from a collection of GitHub repositories.

Sites can be built using a command-line tool, or using the library as a module with browserify. There are options for specifying a project logo, custom css, and other basic formatting. Support for themes coming soon! PRs welcome!

Here is a [**simple example site**](http://minidocs-example.surge.sh) built with `minidocs`

## install

### command-line

Install as a command-line tool

```
npm install -g minidocs
```

### library

Add to your project with

```
npm install --save minidocs
```

## examples

### using minidocs on the command-line

Just specify the location of your markdown files, the table of contents, the output location, and build the site

```
minidocs docs/ --contents contents.json --output site/
```

The folder `site` will now contain the `html`, `js`, and `css` for your site.

**Have a images or other files you'd like to include?** You can copy a directory into the build of your site with the `--assets` option:

```
minidocs docs/ --contents contents.json --output site/ --assets images
```

**Want to change the styles?** Use the `--css` option to include a custom stylesheet.

```
minidocs docs/ --contents contents.json --output site/ --css style.css
```

**[See all other cli options.](https://github.com/freeman-lab/minidocs#command-line-1)**

### using minidocs as a JS module

Create a table of contents in a file named `contents.json`:

```json
{
  "overview": {
    "about": "about.md"
  },
  "animals": {
    "furry": {
      "sheep": "sheep.md"
    },
    "pink": {
      "pig": "pig.md"
    }
  }
}
```

Then build the site and add it to the page with

```javascript
var minidocs = require('minidocs')

var app = minidocs({
  contents: './contents.json',
  markdown: './markdown',,
  logo: './logo.svg'
})

var tree = app.start()
document.body.appendChild(tree)
```

This assumes you have the files `about.md`, `sheep.md`, and `pig.md` inside a local folder `markdown`.

To run this in the browser you'll need to use the minidocs transform with browserify or budo:

**browserify example:**

```
browserify index.js -t minidocs/transform > bundle.js
```

**budo example:**

```
budo index.js:bundle.js -P -- -t minidocs/transform
```

You can also add transforms to your project by adding a `browserify` field to the `package.json` file with a `transform` array:

```js
"browserify": {
  "transform": [
    "minidocs/transform"
  ]
}
```

### about the minidocs transform

Packaged with minidocs is a transform that takes care of reading the contents file, the markdown files, highlighting code in the markdown, and bundling the JS and CSS.

The minidocs transform is only necessary when using minidocs as a JS module, not when using the minidocs cli tool.


## run the example

To run a full example, clone this repository, go into the folder [`example`](example) then call

```
npm install
npm start
```

## usage

### command-line

```
Usage:
  minidocs {sourceDir} -c {contents.json} -o {buildDir}

Options:
  * --contents, -c     JSON file that defines the table of contents
  * --output, -o       Directory for built site [site]
  * --title, -t        Project name [name of current directory]
  * --logo, -l         Project logo
  * --css, -s          Optional stylesheet
  * --assets, -a       Directory of assets to be copied to the built site
  * --initial, -i      Page to use for root url
  * --pushstate, -p    Create a 200.html file for hosting services like surge.sh
  * --basedir, -b      Base directory of the site
  * --full-html, -f    Create HTML files for all routes. Useful for GitHub Pages. [false]
  * --help, -h         Show this help message
```

### library

#### `var minidocs = require('minidocs')`

#### `var app = minidocs(opts)`

Where `opts` is an object that can specify the following options

- `contents` the path to a JSON file or JS module with the table of contents, required
- `markdown` the path to the directory of markdown files
- `styles` a stylesheet, if not required will only use base styles
- `logo` relative file path to a logo file, if unspecified will not include a logo
- `initial` which document to show on load, if unspecified will load the first document
- `root` a DOM node to append to, if unspecified will append to `document.body`
- `basedir` the base route of the minidocs app (useful if published as a project on github pages)

#### `var tree = app.start(rootId?, opts)`
The `start` method accepts the same options as [choo's `start` method](https://github.com/yoshuawuyts/choo#tree--appstartrootid-opts).

This generates the html tree of the application that can be added to the DOM like this:

```js
var tree = app.start()
document.body.appendChild(tree)
```

#### `var html = app.toString(route, state)`
The `toString` method accepts the same options as [choo's `toString` method](https://github.com/yoshuawuyts/choo#html--apptostringroute-state)

We use this in the command-line tool to generate the static files of the site.

## deploying minidocs

### surge.sh

[surge.sh](https://surge.sh) supports HTML5 pushstate if you have a 200.html file in your built site. You can either create that file yourself when using minidocs as a JS module, or you can build the site with the minidocs cli tool and the `--pushstate` option:

```sh
minidocs docs/ -c contents.json --pushstate -o site/
```

##### Deploy with the `surge` command

You can use the [`surge`](https://www.npmjs.com/package/surge) module to push the built site to the [surge.sh service](https://surge.sh).

Install `surge`:

```sh
npm install --save-dev surge
```

Create a `deploy` npm script:

```js
"scripts": {
  "deploy": "surge dist"
}
```

Publish your site:

```sh
npm run deploy
```

### github pages

GitHub Pages doesn't support HTML5 pushstate, so you have two options:

##### 1. Generate the site with the minidocs cli

Build a minidocs site with the cli and the `--full-html` option:

```sh
minidocs path/to/docs/dir -c contents.json -o site --full-html
```

This creates an HTML file for each route of the site, so that on initial page load all content is sent from the server, and once the JS is loaded the minidocs app takes over all routing.

##### 2. Use hash routing with the JS module

To use hash routing, start the app with the `{ hash: true }` option in the `minidocs.start` method:

```js
var tree = app.start({ hash: true })
document.body.appendChild(tree)
```

##### Deploy with the `gh-pages` command

You can use the [`gh-pages`](https://www.npmjs.com/package/gh-pages) module to push the built site to the gh-pages branch of your repo.

> Note: if you're deploying a project at a basedir like username.github.io/project-name, you'll want to use the `--basedir /project-name` option

Install `gh-pages`:

```sh
npm install --save-dev gh-pages
```

Create a `deploy` npm script:

```js
"scripts": {
  "deploy": "gh-pages -d dist"
}
```

Publish your site:

```sh
npm run deploy
```

## license

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/minidocs.svg?style=flat-square
[npm-url]: https://npmjs.org/package/minidocs
[standard-image]: https://img.shields.io/badge/code%20style-standard-lightgray.svg?style=flat-square
[standard-url]: https://github.com/feross/standard
