'use strict'

// WMATA-supplied demo key, note limitations => https://developer.wmata.com/demokey
const DEMO_KEY = '6b700f7ea9db408e9745c207da7ca827'
// this key is used as a fallback if a key isnt supplied

// According to WMATA, "Default tier sufficient for most casual developers.
// Rate limited to 10 calls/second and 50,000 calls per day."
// https://developer.wmata.com/Products

const MAX_CALLS_PER = 10 // cap for concurrent calls within INTERVAL
const INTERVAL = 1000 // in millaseconds

// API docs say real-time info is updated every 20 to 30 seconds

const TIME_TO_LIVE = 25 // time-to-live default expiration in seconds for real-time info

// datasets known to be updated in real time
const REAL_TIME_QUERIES = [
  'BusPositions', // 'busPositions',
  'BusIncidents', // 'busIncidents',
  'Predictions', // 'stopPredictions',
  'ElevatorIncidents', // 'elevatorIncidents',
  'RailIncidents', // 'railIncidents',
  'StationPredictions' // 'stationPredictions'
]

const BASE_URL = 'https://api.wmata.com/'
const BUS_SVC_URL = BASE_URL + 'Bus.svc/json/'
const RAIL_SVC_URL = BASE_URL + 'Rail.svc/json/'
const INCIDENTS_URL = BASE_URL + 'Incidents.svc/json/'

const QUERY_TYPE = {
  // bus info
  stops: BUS_SVC_URL + 'jStops',
  routeDetails: BUS_SVC_URL + 'jRouteDetails',
  routes: BUS_SVC_URL + 'jRoutes',
  routeSchedule: BUS_SVC_URL + 'jRouteSchedule',
  stopSchedule: BUS_SVC_URL + 'jStopSchedule',

  // real-time bus info
  busPositions: BUS_SVC_URL + 'jBusPositions', // BusPositions
  busIncidents: INCIDENTS_URL + 'BusIncidents',
  stopPredictions: BASE_URL + 'NextBusService.svc/json/jPredictions',

  // metrorail info
  lines: RAIL_SVC_URL + 'jLines',
  stationParking: RAIL_SVC_URL + 'jStationParking',
  path: RAIL_SVC_URL + 'jPath',
  stationEntrances: RAIL_SVC_URL + 'jStationEntrances',
  stationInfo: RAIL_SVC_URL + 'jStationInfo', // made redundant by `stations` endpoint
  stations: RAIL_SVC_URL + 'jStations',
  stationTimes: RAIL_SVC_URL + 'jStationTimes',
  srcStationToDstStationInfo: RAIL_SVC_URL + 'jSrcStationToDstStationInfo',

  // real-time rail info
  elevatorIncidents: INCIDENTS_URL + 'ElevatorIncidents',
  railIncidents: INCIDENTS_URL + 'Incidents',
  stationPredictions: BASE_URL + 'StationPrediction.svc/json/GetPrediction/All'
}

// dependencies
const request = require('request')
const requestPromise = require('request-promise')
const Bottleneck = require('bottleneck')

module.exports = class Wmata {
    constructor (options) {
      if (!options) {
        options = {}
      }
      this.apiKey = options.wmataKey || DEMO_KEY
      this.limiter = new Bottleneck(MAX_CALLS_PER, INTERVAL)
      this.ttl = options.ttl || this.constructor.TTL
      this.debugMode = options.debugMode || true // defaults to true
    }

    static get QUERIES () { return QUERY_TYPE }
    static get TTL () { return TIME_TO_LIVE }
    static get REAL_TIME_QUERIES () { return REAL_TIME_QUERIES }

    addTimestamp (responseJson) {
      responseJson.timestamp = Date.now()
      for (let i in this.constructor.REAL_TIME_QUERIES) {
        if (responseJson[REAL_TIME_QUERIES[i]]) {
          responseJson.ttl = this.ttl
          break
        }
      }
      if (this.debugMode) {
        responseJson.captranDebug = {
          debugMode: this.debugMode,
          queryQueueLength: this.queryQueueLength,
          timestamp: responseJson.timestamp,
          ttl: responseJson.ttl
        }
      }
      return responseJson
    }

    renderQueryUrl (params, apiKey) {
      let url = this.constructor.QUERIES[params.queryType]
      if (!url) {
        throw new Error(`Ohnoes, ${params.queryType} isn't a valid queryType`)
      }
      let query = Object.keys(params)
        .filter(key => key !== 'queryType')
        .map(key => `${key}=${params[key]}`)
        .join('&')
      if (query !== '') query += '&'
      return encodeURI(`${url}?` + query + `api_key=${apiKey || this.apiKey}`)
    }

    query (params, callback) {
      if (typeof(params) !== 'object' || !params.queryType)
        throw new Error(`Ohnoes, invalid query params: ${params}`)
      return callback // if
        ? this.limiter.submit( // returns true if successful, invokes callback
          request,
          this.renderQueryUrl(params),
          (err, response) => callback(err, this.addTimestamp(JSON.parse(response)).bind(this))
          )
        : this.limiter // or returns promising version
          .schedule(requestPromise, this.renderQueryUrl(params))
          .then(JSON.parse)
          .then(this.addTimestamp.bind(this))
    }

    queryBusPositions (callback) { // shortcut
      return this.query({
        queryType: 'busPositions'
      })
    }

    get queryQueueLength () {
      return this.limiter.nbQueued()
    }
    get queryQueueIsClear () {
      return this.limiter.check()
    }
}
