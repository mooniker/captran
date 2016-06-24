'use strict'

var env // must include redis server info and config

try { // look for environment config file on local machine
  env = require('./env')
} catch (localEnvJsNotPresentException) { // otherwise use environemnt vars
  env = process.env
}

const wmata = require('./wmata')
const Redis = require('ioredis')

const createDatastoreKey = (endpoint, params) => JSON.stringify({
  endpoint: endpoint,
  params: params
})

// API docs say most real-time info is updated every 20 to 30 seconds
const TTL = 25

var cache = new Redis({ keyPrefix: env.REDIS_KEY_PREFIX || '' })

const secondsTillMidnight = (now) => {
  let midnight = new Date().setHours(24, 0, 0, 0)
  // console.log(midnight.toDateString())
  return (midnight - new Date(now)) / 1000
}

var updateDatastore = (endpoint, params, apiKey, ttl) =>
  wmata.call(endpoint, params, apiKey).then((data) => {
    let key = createDatastoreKey(endpoint, params)
    cache.set(key, JSON.stringify(data))
    cache.expire(key, ttl ? TTL : secondsTillMidnight)
    console.log('ttl set to', ttl ? TTL : new Date(secondsTillMidnight).toDateString())
    return data
  })

var callLocal = function (endpoint, params, apiKey, ttl) {
  return new Promise(function (resolve, reject) {
    let key = createDatastoreKey(endpoint, params)
    cache.get(key, function (error, result) {
      if (error) reject('datastore get error:', error)
      else resolve(JSON.parse(result) || updateDatastore(endpoint, params, apiKey, ttl))
    })
  })
}

module.exports = {

  ping: () => wmata.ping(), // ping dependencies

  metrobus: {
    // ## Bus Position (real-time)
    positions: {
      // requestUrl: wmata.metrobus.getPositions.requestUrl,
      // all: () => callLocal(wmata.requestUrl.forBus.positions, {}, null, true),
      all: () => callLocal({
        url: wmata.requestUrl.forBus.positions
      }),
      // near: (params) => callLocal(wmata.requestUrl.forBus.positions, {
      //   Lat: params.lat,
      //   Lon: params.long,
      //   Radius: params.radius
      // }, null, true),
      // nearPentagon: () => callLocal(wmata.requestUrl.forBus.positions, {
      //   Lat: 38.8690011,
      //   Lon: -77.0544217,
      //   Radius: 500
      // }, null, true),
      nearPentagon: () => callLocal({
        url: wmata.requestUrl.forBus.positions,
        Lat: 38.8690011,
        Lon: -77.0544217,
        Radius: 500
      }),
      // onRoute: (params) => callLocal(wmata.requestUrl.forBus.positions, {
      //   RouteID: params.routeId
      // }),
      // query: (params) => callLocal(wmata.requestUrl.forBus.positions, params, null, true)
      query: params => {
        params.url = wmata.requestUrl.forBus.positions
        return callLocal(params)
      }
    },

    // ## Path Details
    // routeDetails: (params) => callLocal(wmata.requestUrl.forBus.routeDetails, {
    //   RouteID: params.routeId,
    //   Date: params.date // in YYYY-MM-DD format (optional)
    // }),

    routeDetails: {
      query: params => {
        params.url = wmata.requestUrl.forBus.routeDetails
        return callLocal(params)
      }
    },

    // ## Routes

    // routes: () => callLocal(wmata.requestUrl.forBus.routes),

    routes: {
      all: () => callLocal({
        url: wmata.requestUrl.forBus.routes
      }),
      query: () => callLocal({
        url: wmata.requestUrl.forBus.routes
      })
    },

    // ## Schedule

    // routeSchedule: (params) => callLocal(requestUrl.forBus.routeSchedule, {
    //   RouteID: params.routeId,
    //   Date: params.date,
    //   // if omitted (i.e. null), omit, otherwise convert boolean to string "true" or "false"
    //   IncludingVariations: params.includingVariations === null ? null : (includingVariations ? 'true' : 'false')
    //   // not sure if WMATA's API considers true or false the default if omitted
    // }),

    routeSchedule: {
      query: params => {
        params.url = wmata.requestUrl.forBus.routeSchedule
        return callLocal(params)
      }
    },

    // ## Schedule at Stop

    // stopSchedule: (params) => callLocal(wmata.requestUrl.forBus.stopSchedule, {
    //   StopID: params.stopId,
    //   Date: params.date // in YYYY-MM-DD format
    // }),

    stopSchedule: {
      query: params => {
        params.url = wmata.requestUrl.forBus.stopSchedule
        return callLocal(params)
      }
    },

    // ## Stop Search

    stops: {
      // all: () => callLocal(wmata.requestUrl.forBus.stops, {}),
      all: () => callLocal({
        url: wmata.requestUrl.forBus.stops
      }),
      // near: (params) => callLocal(wmata.requestUrl.forBus.stops, {
      //   Lat: params.lat,
      //   Lon: params.long,
      //   Radius: params.radius
      // }),
      near: params => {
        params.url = wmata.requestUrl.forBus.stops
        return callLocal(params)
      },
      query: params => {
        params.url = wmata.requestUrl.forBus.stops
        return callLocal(params)
      },
      nearPentagon: () => callLocal({
        url: wmata.requestUrl.forBus.stops,
        Lat: 38.8690011,
        Lon: -77.0544217,
        Radius: 500
      }),
      // query: (params) => callLocal(wmata.requestUrl.forBus.stops, params)
    },

    // # Real-Time Bus Predictions (JSON, real-time)
    // https://developer.wmata.com/docs/services/5476365e031f590f38092508/operations/5476365e031f5909e4fe331d

    // arrivalPredictions: {
    //   at: stopId => stopId !== '0'
    //     ? callLocal(wmata.requestUrl.forBus.arrivalPredictions, { StopID: stopId })
    //     : Promise.reject('Cant look up bus stop without id'),
    //   query: params => callLocal(wmata.requestUrl.forBus.arrivalPredictions, params),
    //   atLafeyette: () => callLocal(wmata.requestUrl.forBus.arrivalPredictions, {
    //     StopID: '1001141'
    //   })
    // }

    arrivalPredictions: {
      query: params => {
        params.url = wmata.requestUrl.forBus.arrivalPredictions
        return params.StopID !== '0' ? callLocal(params) : Promise.reject('cant look up bus stop without id')
      },
      atLafeyette: () => callLocal({
        url: wmata.requestUrl.forBus.arrivalPredictions,
        StopID: '1001141'
      })
    }

  }

}
