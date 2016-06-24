'use strict'

// This is an example HTTP server for the WMATA API wrapper.

const http = require('http')
// const wmata = require('./wmata')
const wmata = require('./wmata_cache') // WMATA API wrapper (with local caching)

var server = http.createServer((request, response) => {
  const respondWithJson = (object) => {
    response.writeHead(200, {'Content-Type': 'application/json'})
    response.end(JSON.stringify(object))
  }

  function respond404 () {
    response.writeHead(404, {'Content-Type': 'text/html'})
    response.end('Not found.')
  }

  let reqUrl = request.url.split('/')

  switch (reqUrl[1]) {
    case '':
      response.writeHead(200, {'Content-Type': 'text/html'})
      response.end('Hello, world!')
      break
    case 'ping':
      respondWithJson({ 'body': 'pong' })
      break
    case 'buses':
      wmata.metrobus.positions.all().then(respondWithJson, console.error)
      break
    case 'routes':
      wmata.metrobus.routes.all().then(respondWithJson, console.error)
      break
    case 'lafeyette':
      wmata.metrobus.arrivalPredictions.atLafeyette().then(respondWithJson, console.error)
      break
    case 'pentagon':
      if (reqUrl[2] === 'stops')
        wmata.metrobus.stops.nearPentagon().then(respondWithJson, console.error)
      else if (reqUrl[2] === 'buses')
        wmata.metrobus.positions.nearPentagon().then(respondWithJson, console.error)
      else respond404()
      break
    default: respond404()
  }
})

module.exports = server
