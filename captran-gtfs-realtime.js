'use strict'

const GtfsRealtimeBindings = require('gtfs-realtime-bindings')
const request = require('request')

module.exports = class GtfsRealTime {
  constructor (requestSettings) {
    if (requestSettings === 'art') {
      this.requestSettings = {
        method: 'GET',
        url: 'http://realtime.commuterpage.com/rtt/public/utility/gtfsrealtime.aspx/tripupdate',
        encoding: null
      }
    } else if (typeof requestSettings !== 'object') {
      throw new Error('request settings not specified yo')
    } else {
      this.requestSettings = requestSettings
    }
  }

  get (callback) {
    request(this.requestSettings, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        let feed = GtfsRealtimeBindings.FeedMessage.decode(body)
        feed.entity.forEach(function (entity) {
          if (entity.trip_update) {
            callback(null, entity.trip_update)
          } else {
            callback(new Error('No trip_update'))
          }
        })
      } else callback(error || response.statusCode)
    })
  }

  print () {
    this.get((error, data) => {
      console.log(error || data)
    })
  }
}
