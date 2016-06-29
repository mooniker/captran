'use strict'

const port = 5000

var server = require('./server')

server.listen(port, () => console.log('Server is up on port %d.', port))
