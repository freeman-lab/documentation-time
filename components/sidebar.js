var css = require('dom-css')
var inherits = require('inherits')
var foreach = require('lodash.foreach')
var isobject = require('lodash.isobject')
var EventEmitter = require('events').EventEmitter

module.exports = Sidebar
inherits(Sidebar, EventEmitter)

function Sidebar (opts) {
  if (!(this instanceof Sidebar)) return new Sidebar(opts)
  var self = this
  var container = opts.container
  var contents = opts.contents
  var logo = opts.logo
  var title = opts.title
  var pushstate = opts.pushstate

  var style = {
    sidebar: {
      width: '24%',
      paddingLeft: '3%',
      display: 'inline-block',
      paddingBottom: window.innerHeight * 0.03,
      overflowY: 'scroll',
      background: 'rgb(240,240,240)',
      height: window.innerHeight * 0.96
    },
    link: {
      textDecoration: 'none',
      color: 'rgb(80,80,80)'
    }
  }

  var sidebar = document.createElement('div')
  require('./header')(sidebar, logo, title)

  sidebar.className = 'minidocs-contents'
  iterate(sidebar, contents, -1)

  function heading (name, depth) {
    var el
    if (depth === 0) el = document.createElement('h1')
    if (depth === 1) el = document.createElement('h2')
    if (depth === 2) el = document.createElement('h3')
    if (depth === 3) el = document.createElement('h4')
    if (depth === 0) el.innerHTML = '# '
    el.innerHTML += name
    return el
  }

  function iterate (container, contents, depth) {
    foreach(contents, function (value, key) {
      level(container, key, value, depth + 1)
    })
  }

  function level (container, key, value, depth) {
    if (isobject(value) && Object.keys(value).indexOf('file') < 0) {
      var el = document.createElement('div')
      container.appendChild(el)
      el.appendChild(heading(key, depth))
      iterate(el, value, depth)
    } else {
      var item = document.createElement('div')
      css(item, {marginBottom: '5px'})
      container.appendChild(item)
      var link = document.createElement('a')
      css(link, style.link)
      var slug = key.replace(/\s+/g, '-')
      link.id = slug + '-link'
      if (pushstate) link.href = slug
      link.innerHTML = key
      link.className = 'contents-link'

      link.onclick = function () {
        highlight(link)
        self.emit('selected', key)
      }
      item.appendChild(link)
    }
  }

  function highlight (link) {
    foreach(document.querySelectorAll('.contents-link'), function (item) {
      item.className = 'contents-link'
    })
    link.className = 'contents-link contents-link-selected'
  }

  function select (key) {
    highlight(document.querySelector('#' + key + '-link'))
    self.emit('selected', key.replace(/\s+/g, '-'))
  }

  css(sidebar, style.sidebar)
  container.appendChild(sidebar)

  self.select = select
}
