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
  // console.log(key)
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

  call: callLocal,

  metrobus: wmata.metrobus

}
