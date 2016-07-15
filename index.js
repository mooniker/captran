'use strict'

let ENV
try { // look for local environment variable file first
  ENV = require('./env')
} catch (LocalEnvFileNotFound) {
  ENV = process.env
}

const PORT = ENV.PORT || 5000

let server = require('./server')

server.listen(PORT, () => console.log('Server is up on port %d.', PORT))
