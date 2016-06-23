'use strict'

var env // must include WMATA API developer key, accessed as `env.WMATA_KEY`

try { // look for environment config file on local machine
  env = require('./env')
} catch (localEnvJsNotPresentException) { // otherwise use environemnt vars
  env = process.env
}

// According to WMATA, "Default tier sufficient for most casual developers.
// Rate limited to 10 calls/second and 50,000 calls per day."
// https://developer.wmata.com/Products

// API docs say most real-time info is updated every 20 to 30 seconds

// dependencies
const Bottleneck = require('bottleneck')
const Redis = require('ioredis')
// const redis = require('then-redis')

const request = require('request-promise')
const busServicesRequestUrl = 'https://api.wmata.com/Bus.svc/json/'
const requestUrl = {
  forBus: {
    stops: busServicesRequestUrl + 'jStops',
    positions: busServicesRequestUrl + 'jBusPositions',
    routeDetails: busServicesRequestUrl + 'jRouteDetails',
    routes: busServicesRequestUrl + 'jRoutes',
    routeSchedule: busServicesRequestUrl + 'jRouteSchedule',
    stopSchedule: busServicesRequestUrl + 'jStopSchedule',
    arrivalPredictions: 'https://api.wmata.com/NextBusService.svc/json/jPredictions'
  }
}

// helper function to craft request urls with query params for API endpoints
const renderUriWithParams = (uri, params, apiKey) => encodeURI(
    `${uri}?` +
    Object.keys(params).filter((key) =>
      params[key] !== null).map((key) => `${key}=${params[key]}`).join('&') +
        `&api_key=${apiKey || env.WMATA_KEY}`
  )
const createDatastoreKey = (endpoint, params) => JSON.stringify({
  endpoint: endpoint,
  params: params
})

var limiter = new Bottleneck(10, 1000)
var datastore = new Redis({ keyPrefix: env.REDIS_KEY_PREFIX || '' })
// const datastore = redis.createClient()

// var callWmata = (endpoint, params, apiKey) => limiter
//   .schedule(request, renderUriWithParams(endpoint, params, apiKey))
//   .then(JSON.parse)

var callWmata = (endpoint, params, apiKey) => limiter
  .schedule(request, renderUriWithParams(endpoint, params, apiKey))
  .then(JSON.parse)

var updateDatastore = (endpoint, params, apiKey) =>
  callWmata(endpoint, params, apiKey).then((data) => {
    console.log('Updating cache')
    let key = createDatastoreKey(endpoint, params)
    datastore.set(key, JSON.stringify(data))
    datastore.expire(key, 10)
    return data
  })

var callLocal = function (endpoint, params, apiKey) {
  // console.log('callLocal invoked')
  return new Promise(function (resolve, reject) {
    // console.log('creating promise for callLocal')
    let key = createDatastoreKey(endpoint, params)
    datastore.get(key, function (error, result) {
      if (error) reject('datastore get error:', error)
      else if (result) {
        console.log('using cache, not calling wmata')
        datastore.ttl(key, function (err, result) {
          console.log(err || key + 'TTL' + result)
        })
        resolve(result)
      } else {
        console.log('no cache, calling wmata')
        resolve(updateDatastore(endpoint, params, apiKey))
      }
    })
  })
}

const busServices = { // API wrapper for bus services
  // # WMATA Bus Route and Stop Methods (JSON)
  // https://developer.wmata.com/docs/services/54763629281d83086473f231/operations/5476362a281d830c946a3d68

  // ## Bus Position

  // getAllPositions: () => callWmata(requestUrl.forBus.positions, {}),

  // getAllPositions: () => updateCache(requestUrl.forBus.positions, {}),

  getAllPositions: () => callLocal(requestUrl.forBus.positions, {}),


  // getAllPositions: () => redis.get('WMATA Bus Positions')
  //   .then(function(result) {
  //     console.log('result:', result)
  //     return result || callWmata(requestUrl.forBus.positions, {}).then()
  //   }, function(e) {
  //     console.error(e)
  //   }),

  // getAllPositions: () => redis.get('wmata.jBusPositions')
  //   .then((data) => (data) => data || callWmata(requestUrl.forBus.positions, {})
  //     .then((data) => {
  //       redis.set('wmata.jBusPositions', data)
  //     })
  //   ),

  getPositionsNear: (lat, long, radius) => callWmata(requestUrl.forBus.positions, {
    Lat: lat,
    Lon: long,
    Radius: radius
  }),

  getPositionsOnRoute: (routeId) => callWmata(requestUrl.forBus.positions, {
    RouteID: routeId
  }),

  // ## Path Details

  getRouteDetails: (routeId, date) => callWmata(requestUrl.forBus.routeDetails, {
    RouteID: routeId,
    Date: date // in YYYY-MM-DD format (optional)
  }),

  // ## Routes

  getRoutes: () => callWmata(requestUrl.forBus.routes),

  // ## Schedule

  getRouteSchedule: (routeId, date, includingVariations) => callWmata(requestUrl.forBus.routeSchedule, {
    RouteID: routeId,
    Date: date,
    // if omitted (i.e. null), omit, otherwise convert boolean to string "true" or "false"
    IncludingVariations: includingVariations === null ? null : (includingVariations ? 'true' : 'false')
    // not sure if WMATA's API considers true or false the default if omitted
  }),

  // ## Schedule at Stop

  getStopSchedule: (stopId, date) => callWmata(requestUrl.forBus.stopSchedule, {
    StopID: stopId,
    Date: date // in YYYY-MM-DD format
  }),

  // ## Stop Search

  getAllStops: () => callWmata(requestUrl.forBus.stops, {}),

  getStops: (lat, long, radius) => callWmata(requestUrl.forBus.stops, {
    Lat: lat,
    Lon: long,
    Radius: radius
  }),

  // hard-coded shortcut for development
  getPentagonStops: () => callWmata(requestUrl.forBus.stops, {
    Lat: 38.8690011,
    Lon: -77.0544217,
    Radius: 500
  }),

  // # Real-Time Bus Predictions (JSON)
  // https://developer.wmata.com/docs/services/5476365e031f590f38092508/operations/5476365e031f5909e4fe331d

  getArrivalPredictions: (stopId) => {
    if (stopId === '0') {
      let msg = 'Cant look up bus stop without id'
      console.error(msg)
      return Promise.reject(msg)
    } else return callWmata(requestUrl.forBus.arrivalPredictions, { StopID: stopId })
  }
}

// const railService = {
//   // TODO
// }
//
// const incidents = {
//   // TODO
// }

module.exports = {

  ping: (request) => JSON.parse('{ "body": "pong"}'),

  // WMATA Bus Route and Stop Methods (JSON)
  metrobus: busServices,

  // WMATA Rail Station Information (JSON)
  // metrorail: railService,

  // helper function for rendering request URL with query parameters
  renderUriWithParams: renderUriWithParams // exported for testing

}
