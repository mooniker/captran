'use strict'

// This is an example HTTP server for the WMATA API wrapper.

const http = require('http')
const Primus = require('primus')
const primusOptions = { transformer: 'engine.io' }

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
    case 'buses':
      wmata.call(wmata.metrobus.positions.all).then(respondWithJson, console.error)
      break
    case 'routes':
      wmata.call(wmata.metrobus.routes.all).then(respondWithJson, console.error)
      break
    case 'lafeyette':
      wmata.call(wmata.metrobus.arrivalPredictions.atLafeyette).then(respondWithJson, console.error)
      break
    case 'pentagon':
      if (reqUrl[2] === 'stops')
        wmata.call(wmata.metrobus.stops.nearPentagon).then(respondWithJson, console.error)
      else if (reqUrl[2] === 'buses')
        wmata.call(wmata.metrobus.positions.nearPentagon).then(respondWithJson, console.error)
      else respond404()
      break
    default: respond404()
  }
})

var primus = new Primus(server, primusOptions)

primus.on('connection', spark => {
  spark.write({
    debugLog: `WMATA API callsQued: ${wmata.callsQueued()}`
  })

  // console.log('connection:', spark.headers, spark.address, spark.id)

  spark.on('data', data => {
    console.log('received routes req', data)
    wmata.call(wmata.metrobus.routes.all)
      // .then(spark.write) // doesnt work, wonder why
      .then(data => {
        spark.write(data)
      })
  })
})


module.exports = server
