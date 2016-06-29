var choo = require('choo')

var parseDocs = require('./lib/parse-docs')
var main = require('./components/main')

module.exports = function (opts) {
  var app = choo()
  var docs = parseDocs(opts)

  app.model({
    state: {
      title: opts.title,
      logo: opts.logo,
      contents: docs.contents,
      markdown: docs.markdown,
      html: docs.html,
      routes: docs.routes,
      current: docs.initial
    },
    reducers: {}
  })

  app.router(function (route) {
    return [
      route('/', main),
      route('/:page', main)
    ]
  })

  return app
}
