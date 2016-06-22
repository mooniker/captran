'use strict'

var env

try {
  env = require('./env')
} catch (localEnvJsNotPresentException) {
  env = process.env
}

const port = env.PORT

var server = require('./server')

server.listen(port, () => console.log('Server is up on port %d.', port))
