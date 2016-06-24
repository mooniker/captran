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

const TTL = 30

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

// creates query url from given params, including the base url
const renderQueryUrl = (params, apiKey) => {
  // raise error of parameters isn't an object TODO
  let url = params.url
  let query = '?' + Object.keys(params)
    .filter((key) => key !== 'url') // take out url
    .map((key) => `${key}=${params[key]}`)
    .join('&') + `&api_key=${apiKey || env.WMATA_KEY}`
  return encodeURI(`${url}` + query)
}

function stampTime (json) {
  // timestamp the json
  json.timestamp = new Date().getTime()
  // bus positions and predicted arrivals are the only real-time data
  // if json describes real-time info, assign it a time-to-live value
  if (json.BusPositions || json.StopName) {
    json.ttl = TTL
  }
  return json
}

var limiter = new Bottleneck(10, 1000)

// apiKey set to falsy defaults to environement var
// var callWmata = (endpoint, params, apiKey) => limiter
//   .schedule(request, renderUriWithParams(endpoint, params, apiKey))
//   .then(JSON.parse).then(stampTime)

const callWmata = params => limiter
  .schedule(request, renderQueryUrl(params))
  .then(JSON.parse).then(stampTime)

const busServices = { // API wrapper for bus services
  // # WMATA Bus Route and Stop Methods (JSON)
  // https://developer.wmata.com/docs/services/54763629281d83086473f231/operations/5476362a281d830c946a3d68

  // ## Bus Position

  positions: {
    // all: () => callWmata(requestUrl.forBus.positions, {}),
    all: () => callWmata({
      url: requestUrl.forBus.positions
    }),
    nearPentagon: () => callWmata({
      url: requestUrl.forBus.positions,
      Lat: 38.8690011,
      Lon: -77.0544217,
      Radius: 500
    }),
    query: params => {
      params.url = requestUrl.forBus.positions
      return callWmata(params)
    }
  },

  // ## Path Details

  routeDetails: {
    query: params => {
      params.url = requestUrl.forBus.routeDetails
      return callWmata(params)
    }
  },

  // ## Routes

  routes: {
    all: () => callWmata({
      url: requestUrl.forBus.routes
    }),
    query: () => callWmata({
      url: requestUrl.forBus.routes
    })
  },

  // ## Schedule

  routeSchedule: {
    query: params => {
      params.url = requestUrl.forBus.routeSchedule
      return callWmata(params)
    }
  },

  // ## Schedule at Stop

  stopSchedule: {
    query: params => {
      params.url = requestUrl.forBus.stopSchedule
      return callWmata(params)
    }
  },

  // ## Stop Search

  stops: {
    all: () => callWmata({
      url: requestUrl.forBus.stops
    }),
    near: params => {
      params.url = requestUrl.forBus.stops
      return callWmata(params)
    },
    query: params => {
      params.url = requestUrl.forBus.stops
      return callWmata(params)
    },
    nearPentagon: () => callWmata({
      url: requestUrl.forBus.stops,
      Lat: 38.8690011,
      Lon: -77.0544217,
      Radius: 500
    })
  },

  // # Real-Time Bus Predictions (JSON)
  // https://developer.wmata.com/docs/services/5476365e031f590f38092508/operations/5476365e031f5909e4fe331d

  arrivalPredictions: {
    query: params => {
      params.url = requestUrl.forBus.arrivalPredictions
      return params.StopID !== '0' ? callWmata(params) : Promise.reject('cant look up bus stop without id')
    },
    atLafeyette: () => callWmata({
      url: requestUrl.forBus.arrivalPredictions,
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
  // renderUriWithParams: renderUriWithParams, // exported for testing
  renderQueryUrl: renderQueryUrl,

  // returns number of calls queued up due to rate limiting
  callsQueued: () => limiter.nbQueued(),
  // returns boolean whether queue is empty
  checkCallQueue: () => limiter.check()

}
