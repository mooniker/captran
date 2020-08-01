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

module.exports = class Gbfs {
  constructor (config) {
    this.data = null
    this.gbfs = undefined
    this.isInitialized = false
    if (config.gbfsUrl) {
      this.gbfsUrl = config.gbfsUrl
      this.updateGbfs((error, result) => {
        if (!error && result) {
          this.isInitialized = true
        }
      })
    } else throw new Error('GBFS.json URL not specified.')
    // this.filePaths = {
    //   // these are required, according to spec
    //   system_information: undefined,
    //   station_information: undefined,
    //   station_status: undefined,
    //   // this is optional, according to spec
    //   gbfs: null
    // }
    // this.files = {
    //   gbfs: undefined,
    //   system_information: undefined,
    //   station_information: undefined,
    //   station_status: undefined
    // }
    // this.data = {}
    // // if gbfsUrl is provided, figure out all the files from that
    // try {
    //   this.gbfsUrl = config.gbfsUrl
    // } catch (e) {
    //   throw new Error('gbfsUrl must be specified')
    // }
    // // else if file urls are provided explicly, use those
    // // else if a base url/folder is given, assume the req'd files are in there
    // // else throw an error
    // this.init()
  }

  get gbfs () { return this.gbfs }
  get data () { return this.data }

  updateGbfs (callback) {
    request(this.gbfsUrl, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        callback(error || new Error(response.statusCode))
      } else {
        this.gbfs = JSON.parse(body)
        callback(null, JSON.parse(body))
      }
    })
  }

  update (lang, fileName, callback) {
    // request(this.gbfs)
    if (this.gbfs) {
      request(this.gbfs[lang].feeds[fileName].url, (error, response, body) => {
        if (error || response.statusCode !== 200) {
          callback(error || new Error(response.statusCode))
        } else {
          let freshData = JSON.parse(body)
          this.data[lang].feeds[fileName] = freshData
          callback(null, freshData)
        }
      })
    } else callback(new Error('no gbfs'))
  }

  get (lang, file, callback) {
    try {
      let requestedFile = this.data[lang].feeds[file]
      if (requestedFile.last_updated + requestedFile.ttl < Date.now()) {
        callback(null, requestedFile)
      } else {
        this.update(lang, file, callback)
      }
    } catch (e) {
      console.error(e)
    }
  }

  query (lang, file, callback) {
    if (!this.files.gbfs) {
      callback(new Error('gbfs not initialized (yet)'))
    } else if (this.files.gbfs.last_updated + this.gbfs.ttl > Date.now()) {
      this.updateGbfs((error, result) => {
        if (error) callback(error)
        else this.query(lang, file, callback)
      })
    } else {
      this.get(lang, file, callback)
    }
  }

  query (lang, fileName, callback) {
    function get (gbfsJson) {
      if (gbfs.data[lang].feeds[fileName]) {
        callback()
      }
    }
    if (!this.gbfs || this.gbfs.ttl === 0 || this.gbfs.last_updated + this.gbfs.ttl < Date.now()) {
      // get a fresh gbfs
      request

    } else this.get(lang, fileName, callback)
  }

  dirLang (callback) {

  }

  // update (callback) {
  //   request(this.gbfsUrl, (error, response, body) => {
  //     if (error || response.statusCode !== 200) {
  //       // console.error(error || response.statusCode)
  //       callback(error || new Error(response.statusCode))
  //     } else {
  //       this.gbfs = JSON.parse(body)
  //       this.isInitialized = true
  //     }
  //   })
  // }

}
