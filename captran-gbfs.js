'use strict'

const request = require('request')

// gbfs.json	Optional	Auto-discovery file that links to all of the other files published by the system. This file is optional, but highly recommended.
// system_information.json	Yes	Describes the system including System operator, System location, year implemented, URLs, contact info, time zone
// station_information.json	Yes	Mostly static list of all stations, their capacities and locations
// station_status.json	Yes	Number of available bikes and docks at each station and station availability
// free_bike_status.json	Optional	Describes bikes that are available in non station-based systems
// system_hours.json	Optional	Describes the hours of operation for the system
// system_calendar.json	Optional	Describes the days of operation for the system
// system_regions.json	Optional	Describes the regions the system is broken up into
// system_pricing_plans.json	Optional	Describes the system pricing
// system_alerts.json	Optional	Describes current system alerts

const request200 = (url, callback) => {
  request(url, (error, response, body) => {
    if (error || response.statusCode !== 200) {
      callback(error || new Error(response.statusCode))
    } else {
      callback(null, JSON.parse(body))
    }
  })
}

module.exports = class Gbfs {
  constructor (config) {
    // this.gbfs = undefined
    if (config.gbfsUrl) {
      this.gbfsUrl = config.gbfsUrl
    } else throw new Error('GBFS.json URL not specified.')
  }

  gbfs (callback) {
    request200(this.gbfsUrl, callback)
  }

  query (lang, fileName, callback) {
    this.gbfs((error, gbfs) => {
      if (error || !gbfs) callback(error || new Error('no gbfs?'))
      else {
        let feeds = gbfs.data[lang].feeds
        try {
          var url = feeds.filter(feed => feed.name === fileName)[0].url
        } catch (e) {
          callback(e)
        }
        request200(url, callback)
      }
    })
  }

  dir () {
    this.gbfs((error, gbfs) => {
      if (error) {
        console.error(error)
      } else {
        for (let lang in gbfs.data) {
          console.log(lang)
          gbfs.data[lang].feeds.forEach(feed => {
            console.log(' ', feed.name)
          })
        }
      }
    })
  }

}
