var deps = {}  // save a global instance of the deps

const jwt = require('restify-jwt')
const datastore = require('nedb-promise')

module.exports.create = function (app, overrides) {
  let config = Object.assign({}, process.env)
  let userStore = datastore()
  let ideaStore = datastore()
  deps = {
    app,
    config,
    userStore,
    ideaStore
  }
  if (overrides) {
    deps = Object.assign(deps, overrides)
  }
  return deps
}

module.exports.bootRestify = function (restify, app) {
  app.use(restify.requestLogger())
  app.use(restify.queryParser())
  app.use(restify.bodyParser())
  app.use(restify.gzipResponse())
  restify.CORS.ALLOW_HEADERS.push('accept')
  restify.CORS.ALLOW_HEADERS.push('host')
  restify.CORS.ALLOW_HEADERS.push('sid')
  restify.CORS.ALLOW_HEADERS.push('lang')
  restify.CORS.ALLOW_HEADERS.push('origin')
  restify.CORS.ALLOW_HEADERS.push('authorization')
  restify.CORS.ALLOW_HEADERS.push('x-access-token')
  app.use(restify.fullResponse())
  app.use(restify.CORS())

  app.pre((req, res, next) => {
    req.headers.authorization = 'Bearer ' + req.headers['x-access-token']
    return next()
  })

  app.use(jwt({secret: deps.config.JWT_SECRET,
    requestProperty: 'user' }).unless({path: ['/test', '/users', '/access-tokens/refresh', {
      url: '/access-tokens', methods: ['POST']}]}))
}
