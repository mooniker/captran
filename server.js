'use strict'

// This is an example HTTP server for the WMATA API wrapper.

const http = require('http')

// const Wmata = require('./captran-wmata-dev')
// var wmata = new Wmata()
const CapTran = require('./captran')
var captran = new CapTran()

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

  let indexHtml = `Hello, world!
  <script src="/primus/primus.js"></script>
  <script>
  // connect to current url
  var primus = Primus.connect()
  primus.on('open', function() {
    console.log('connected!')
    setTimeout(function() {
      console.log('testing')
      primus.write('routes')
    }, 1000)
  })
  primus.on('data', function(data) {
    console.log('data:', data)
  })
  </script>
  `

  switch (reqUrl[1]) {
    case '':
      response.writeHead(200, {'Content-Type': 'text/html'})
      // response.end('Hello, world!')
      response.end(indexHtml)
      break
    case 'ping':
      respondWithJson({ 'body': 'pong' })
      break
    case 'busPositions':
    case 'buses':
      captran.query({
        api: 'busPositions'
      }).then(respondWithJson, console.error)
      break
    case 'routes':
    case 'busRoutes':
      captran.query({
        api: 'routes'
      }).then(respondWithJson, console.error)
      break
    case 'lafeyette':
      captran.query({
        api: 'stopPredictions',
        StopID: '1001141'
      }).then(respondWithJson, console.error)
      break
    case 'pentagon':
      if (reqUrl[2] === 'stops')
        captran.query({
          api: 'stops',
          Lat: 38.8690011,
          Lon: -77.0544217,
          Radius: 500
        }).then(respondWithJson, console.error)
      else if (reqUrl[2] === 'buses')
        captran.query({
          api: 'busPositions',
          Lat: 38.8690011,
          Lon: -77.0544217,
          Radius: 500
        }).then(respondWithJson, console.error)
      else respond404()
      break
    default: respond404()
  }
})

module.exports = server
