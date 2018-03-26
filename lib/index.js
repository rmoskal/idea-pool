const appFactory = require('./AppFactory')
const restify = require('restify')
const bunyan = require('bunyan')
const log = bunyan.createLogger({name: 'showtime'})
const server = restify.createServer({
  log: log
})

let deps = appFactory.create(server)
appFactory.bootRestify(restify, server)

require('./Api')(deps)

server.listen(deps.config.PORT || 3030, function () {
  console.log('Server started 🌎  ', deps.config.PORT || 3030)
})
