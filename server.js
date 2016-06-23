'use strict'

// This is an example HTTP server for the WMATA API wrapper.

const http = require('http')
const wmata = require('./wmata') // WMATA API wrapper

var server = http.createServer((request, response) => {
  const respondWithJson = (object) => {
    response.writeHead(200, {'Content-Type': 'application/json'})
    response.end(JSON.stringify(object))
  }

  switch (request.url) {
    case '/':
      response.writeHead(200, {'Content-Type': 'text/html'})
      response.end('Hello, world!')
      break
    case '/ping':
      respondWithJson({ 'body': 'pong' })
      break
    case '/buses':
      wmata.metrobus.getAllPositions().then(respondWithJson, console.error)
      break
    case '/pentagon': // bus stops near the Pentagon
      wmata.metrobus.getPentagonStops().then(respondWithJson, console.error)
      break
    default:
      response.writeHead(404, {'Content-Type': 'text/html'})
      response.end('Not found.')
  }
})

module.exports = server
