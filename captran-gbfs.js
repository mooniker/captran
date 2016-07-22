'use strict'

const request = require('request')
const requestPromise = require('request-promise')
const _ = require('lodash')

const request200 = (url, callback) => {
  return callback // if callback supplied, return a request invokes that callback
    ? request(url, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        callback(error || new Error(response.statusCode))
      } else callback(null, JSON.parse(body))
    }) // if callback not supplied, return a promise
    : requestPromise(url, (error, response, body) => {
      if (error || response.statusCode !== 200) throw error || new Error(response.statusCode)
    }).then(JSON.parse)
}

const calcDistanceBetweenLatLongs = (lat1, lon1, lat2, lon2) => {
  const p = 0.017453292519943295 // Math.PI / 180
  const cos = Math.cos
  let a = 0.5 - cos((lat2 - lat1) * p) / 2 +
          cos(lat1 * p) * cos(lat2 * p) *
          (1 - cos((lon2 - lon1) * p)) / 2
  return 12742 * Math.asin(Math.sqrt(a)) // 2 * R; R = 6371 km
}

module.exports = class Gbfs {
  constructor (config) {
    this.gbfsData = undefined
    this.files = undefined
    if (config.gbfsUrl) {
      this.gbfsUrl = config.gbfsUrl
      this.lang = config.lang || 'en'
    } else throw new Error('GBFS.json URL not specified.')
    console.log('created', config)
  }

  gbfs (callback) {
    // console.log('gbfs.json requested.')
    if (!this.gbfsData || this.gbfsData.last_updated + this.gbfsData.ttl < Date.now()) {
      // if gbfs data hasnt been cached or is too old, get new data
      return request200(this.gbfsUrl, callback)
    } else {
      // console.log('Using cached gbfs.')
      return callback
        ? callback(null, this.gbfsData)
        : Promise.resolve(this.gbfsData)
    }
  }

  getFile (fileName, callback) {
    let getUrlForFile = gbfs => {
      let lang = this.lang || 'en'
      let feeds = gbfs.data[lang].feeds
      let url = feeds.filter(feed => feed.name === fileName)[0].url
      if (url) {
        return url
      } else {
        console.error(lang, fileName, 'not found in', feeds)
      }
      return null // error
    }
    if (callback) {
      this.gbfs().then(gbfs => {
        return request200(getUrlForFile(gbfs), callback)
      }).catch(error => callback(error))
    } else {
      return this.gbfs().then(gbfsData => request200(getUrlForFile(gbfsData)))
    }
  }

  // Shortcuts for GBFS required files
  getSystemInfo (callback) {
    return this.getFile('system_information', callback)
  }
  getStationInfo (callback) {
    return this.getFile('station_information', callback)
  }
  getStationStatus (callback) {
    return this.getFile('station_status', callback)
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

  getStations (xcallback) {
    return Promise.all([
      this.getFile('station_information'),
      this.getFile('station_status')
    ]).then(results => {
      let stationInfos = results[0].data.stations
      let statuses = results[1].data.stations
      // last_updated and ttl should be the older of the the two files
      let lastUpdated = results[0].last_updated < results[1].last_updated ? results[0].last_updated : results[1].last_updated
      let ttl = results[0].ttl < results[1].ttl ? results[0].ttl : results[1].ttl
      let mergedStationsData = _.map(stationInfos, item => _.extend(item, _.find(statuses, { station_id: item.station_id })))
      return {
        last_updated: lastUpdated,
        ttl: ttl,
        data: mergedStationsData
      }
    })
  }

  getStationsNear (lat, lon, radius, xcallback) {
    return this.getStations().then(stationsData => {
      let nearbyStations = stationsData.data.filter(station => {
        return calcDistanceBetweenLatLongs(lat, lon, station.lat, station.lon) <= radius
      })
      return {
        last_updated: stationsData.last_updated,
        ttl: stationsData.ttl,
        data: nearbyStations
      }
    })
  }

}
