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
const request = require('request-promise')
const Bottleneck = require('bottleneck')

const busServicesRequestUrl = 'https://api.wmata.com/Bus.svc/json/'
const requestUrl = {
  forBus: {
    stops: busServicesRequestUrl + 'jStops',
    routeDetails: busServicesRequestUrl + 'jRouteDetails',
    routes: busServicesRequestUrl + 'jRoutes',
    routeSchedule: busServicesRequestUrl + 'jRouteSchedule',
    stopSchedule: busServicesRequestUrl + 'jStopSchedule',
    // real-time
    positions: busServicesRequestUrl + 'jBusPositions',
    arrivalPredictions: 'https://api.wmata.com/NextBusService.svc/json/jPredictions'
  }
}

// helper function to craft request urls with query params for API endpoints
const renderUriWithParams = (uri, params, apiKey) => {
  // console.log(uri, params, apiKey)
  // if (params) console.log('hey')
  // else console.log('no hey')
  let url = encodeURI(
    `${uri}?` + (params ? Object.keys(params).filter((key) =>
      params[key] !== null).map((key) => `${key}=${params[key]}`).join('&') : '') +
        `&api_key=${apiKey || env.WMATA_KEY}`
  )
  // console.log(url)
  return url
}

function stampTime(json) {
  // timestamp the json
  json.timestamp = new Date().getTime()
  // bus positions and predicted arrivals are the only real-time data
  // if json describes real-time info, assign it a time-to-live value
  if (json.BusPositions || json.StopName) {
    json.ttl = 25
  }
  return json
}

var limiter = new Bottleneck(10, 1000)
// var datastore = new Redis({ keyPrefix: env.REDIS_KEY_PREFIX || '' })

// apiKey set to falsy defaults to environement var
var callWmata = (endpoint, params, apiKey) => limiter
  .schedule(request, renderUriWithParams(endpoint, params, apiKey))
  .then(JSON.parse).then(stampTime)

const busServices = { // API wrapper for bus services
  // # WMATA Bus Route and Stop Methods (JSON)
  // https://developer.wmata.com/docs/services/54763629281d83086473f231/operations/5476362a281d830c946a3d68

  // ## Bus Position

  positions: {
    // ping: () => 'pong',
    // requestUrl: requestUrl.forBus.positions,
    all: () => callWmata(requestUrl.forBus.positions, {}),
    near: (params) => callWmata(requestUrl.forBus.positions, {
      Lat: params.lat,
      Lon: params.long,
      Radius: params.radius
    }),
    nearPentagon: () => callWmata(requestUrl.forBus.positions, {
      Lat: 38.8690011,
      Lon: -77.0544217,
      Radius: 500
    }),
    onRoute: (params) => callWmata(requestUrl.forBus.positions, {
      RouteID: params.routeId
    }),
    query: (params) => callWmata(requestUrl.forBus.positions, params)
  },

  // ## Path Details

  routeDetails: (params) => callWmata(requestUrl.forBus.routeDetails, {
    RouteID: params.routeId,
    Date: params.date // in YYYY-MM-DD format (optional)
  }),

  // ## Routes

  routes: () => callWmata(requestUrl.forBus.routes),

  // ## Schedule

  routeSchedule: (routeId, date, includingVariations) => callWmata(requestUrl.forBus.routeSchedule, {
    RouteID: routeId,
    Date: date,
    // if omitted (i.e. null), omit, otherwise convert boolean to string "true" or "false"
    IncludingVariations: includingVariations === null ? null : (includingVariations ? 'true' : 'false')
    // not sure if WMATA's API considers true or false the default if omitted
  }),

  // ## Schedule at Stop

  stopSchedule: (params) => callWmata(requestUrl.forBus.stopSchedule, {
    StopID: params.stopId,
    Date: params.date // in YYYY-MM-DD format
  }),

  // ## Stop Search

  stops: {
    all: () => callWmata(requestUrl.forBus.stops, {}),
    near: (params) => callWmata(requestUrl.forBus.stops, {
      Lat: params.lat,
      Lon: params.long,
      Radius: params.radius
    }),
    nearPentagon: () => callWmata(requestUrl.forBus.stops, {
      Lat: 38.8690011,
      Lon: -77.0544217,
      Radius: 500
    }),
    query: (params) => callWmata(requestUrl.forBus.stops, params)
  },

  // # Real-Time Bus Predictions (JSON)
  // https://developer.wmata.com/docs/services/5476365e031f590f38092508/operations/5476365e031f5909e4fe331d

  arrivalPredictions: {
    at: stopId => stopId !== '0'
      ? callWmata(requestUrl.forBus.arrivalPredictions, { StopID: stopId })
      : Promise.reject('Cant look up bus stop without id'),
    query: params => callWmata(requestUrl.forBus.arrivalPredictions, params),
    atLafeyette: () => callWmata(requestUrl.forBus.arrivalPredictions, {
      StopID: '1001141'
    })
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

  ping: () => 'pong',

  call: callWmata,

  requestUrl: requestUrl, // export request URLS for use elsewhere

  // WMATA Bus Route and Stop Methods (JSON)
  metrobus: busServices,

  // WMATA Rail Station Information (JSON)
  // metrorail: railService,

  // helper function for rendering request URL with query parameters
  renderUriWithParams: renderUriWithParams, // exported for testing

  // returns number of calls queued up due to rate limiting
  callsQueued: () => limiter.nbQueued(),
  // returns boolean whether queue is empty
  checkCallQueue: () => limiter.check()

}
