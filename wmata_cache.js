'use strict'

var env // must include redis server info and config

try { // look for environment config file on local machine
  env = require('./env')
} catch (localEnvJsNotPresentException) { // otherwise use environemnt vars
  env = process.env
}

const wmata = require('./wmata')
const Redis = require('ioredis')

var cache = new Redis({ keyPrefix: env.REDIS_KEY_PREFIX || '' })

// const secondsTillMidnight = (now) =>
//   new Date().setHours(24, 0, 0, 0) - new Date(now).getTime()

const updateDatastore = params => wmata.call(params).then(data => {
  let key = JSON.stringify(params)
  console.log(key)
  cache.set(key, JSON.stringify(data))
  if (data.ttl) {
    cache.expire(key, data.ttl)
    // console.log('ttl set to', data.ttl)
  } else {
    let s = 3600 // one hour
    cache.expire(key, s)
    // console.log(`ttl set to ${s}`)
  }
  return data
})

const callLocal = params => new Promise((resolve, reject) => {
  let key = JSON.stringify(params)
  // console.log(key)
  cache.get(key, (error, result) => {
    if (error) reject(error)
    // console.log(error, result)
    if (result) {
      // console.log('resuing cache')
      resolve(JSON.parse(result))
    } else {
      // console.log('need to ask api for new data')
      resolve(updateDatastore(params))
    }
  })
})

module.exports = {

  ping: () => wmata.ping(), // ping dependencies

  metrobus: {

    // ## Bus Position (real-time)

    positions: {
      all: () => callLocal({
        url: wmata.requestUrl.forBus.positions
      }),
      nearPentagon: () => callLocal({
        url: wmata.requestUrl.forBus.positions,
        Lat: 38.8690011,
        Lon: -77.0544217,
        Radius: 500
      }),
      query: params => {
        params.url = wmata.requestUrl.forBus.positions
        return callLocal(params)
      }
    },

    // ## Path Details

    routeDetails: {
      query: params => {
        params.url = wmata.requestUrl.forBus.routeDetails
        return callLocal(params)
      }
    },

    // ## Routes

    routes: {
      all: () => callLocal({
        url: wmata.requestUrl.forBus.routes
      }),
      query: () => callLocal({
        url: wmata.requestUrl.forBus.routes
      })
    },

    // ## Schedule

    routeSchedule: {
      query: params => {
        params.url = wmata.requestUrl.forBus.routeSchedule
        return callLocal(params)
      }
    },

    // ## Schedule at Stop

    stopSchedule: {
      query: params => {
        params.url = wmata.requestUrl.forBus.stopSchedule
        return callLocal(params)
      }
    },

    // ## Stop Search

    stops: {
      all: () => callLocal({
        url: wmata.requestUrl.forBus.stops
      }),
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
      })
    },

    // # Real-Time Bus Predictions (JSON, real-time)
    // https://developer.wmata.com/docs/services/5476365e031f590f38092508/operations/5476365e031f5909e4fe331d

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
