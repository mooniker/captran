'use strict'

// const GtfsRealtimeBindings = require('gtfs-realtime-bindings')
// const request = require('request')
//
// const requestSettings = {
//   method: 'GET',
//   url: 'http://realtime.commuterpage.com/rtt/public/utility/gtfsrealtime.aspx/tripupdate',
//   encoding: null
// }
// request(requestSettings, function (error, response, body) {
//   if (!error && response.statusCode === 200) {
//     let feed = GtfsRealtimeBindings.FeedMessage.decode(body)
//     feed.entity.forEach(function (entity) {
//       if (entity.trip_update) {
//         console.log(entity.trip_update)
//       } else {
//         console.log('nope')
//       }
//     })
//   }
// })

const requestSettings = {
  method: 'GET',
  url: 'http://realtime.commuterpage.com/rtt/public/utility/gtfsrealtime.aspx/tripupdate',
  // url: 'http://rideonrealtime.net/gtfs_realtime',
  encoding: null
}

const http = require('http')
const GtfsRealtimeBindings = require('gtfs-realtime-bindings')
const request = require('request')

var server = http.createServer(function (req, response) {
  const respondWithJson = object => {
    response.writeHead(200, {'Content-Type': 'application/json'})
    response.end(JSON.stringify(object))
  }
  // respondWithJson({ hello: 'world' })
  request(requestSettings, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      let feed = GtfsRealtimeBindings.FeedMessage.decode(body)
      feed.entity.forEach(function (entity) {
        if (entity.trip_update) {
          // console.log(entity.trip_update)
          respondWithJson(entity.trip_update)
        } else {
          console.log({ error: 'nope' })
        }
      })
    } else console.error(error || response.statusCode)
  })
})

const PORT = 5000
server.listen(PORT, () => console.log('Server is up on port %d.', PORT))
