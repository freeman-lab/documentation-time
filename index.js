var fs = require('fs')
var path = require('path')
var css = require('dom-css')
var marked = require('marked')
var camelcase = require('camelcase')
var isobject = require('lodash.isobject')
var foreach = require('lodash.foreach')
var insertcss = require('insert-css')
var hl = require('highlight.js')

module.exports = function (opts) {
  if (!opts.contents) throw new Error('contents option is required')
  if (!opts.markdown) throw new Error('markdown option is required')

  var contents = opts.contents
  var documents = opts.markdown
  var logo = opts.logo
  var styles = opts.styles
  var initial = opts.initial
  var title = opts.title || ''
  var node = opts.node || document.body

  marked.setOptions({
    highlight: function (code, lang) {
      var out = lang ? hl.highlight(lang, code) : hl.highlightAuto(code)
      return out.value
    }
  })

  var parsed = {}
  foreach(documents, function (value, key) {
    parsed[key] = marked(value)
  })

  var lookup = {}
  var first
  function iterate (data) {
    foreach(data, function (value, key) {
      if (isobject(value) && Object.keys(value).indexOf('file') < 0) {
        iterate(value)
      } else {
        if (!first) first = key
        lookup[key] = typeof value === 'string' ? { file: value } : value
      }
    })
  }

  iterate(contents)

  var container = document.createElement('div')
  container.className = 'minidocs'
  node.appendChild(container)
  css(node, {margin: '0px', padding: '0px'})
  css(container, {width: '100%', marginLeft: '0%', marginRight: '0%'})

  if (styles) insertcss(styles)

  var basecss = fs.readFileSync(path.join(__dirname, './components/styles/base.css'))
  var fontcss = fs.readFileSync(path.join(__dirname, './components/styles/fonts.css'))
  var githubcss = fs.readFileSync(path.join(__dirname, './components/styles/github-markdown.css'))
  var highlightcss = fs.readFileSync(path.join(__dirname, './components/styles/highlighting/tomorrow.css'))
  insertcss(basecss)
  insertcss(fontcss)
  insertcss(githubcss)
  insertcss(highlightcss)

  var sidebar = require('./components/sidebar')(container, contents, logo, title)
  var main = require('./components/main')(container)

  sidebar.on('selected', function (key) {
    var value = lookup[key]
    var fileid = camelcase(value.file.replace('.md', ''))
    main.show({ text: parsed[fileid], link: value.link, key: key })
  })

  if (initial) sidebar.select(initial)
  else sidebar.select(first)
}
