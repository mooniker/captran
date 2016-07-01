const Wmata = require('./captran-wmata')
const Redis = require('ioredis')

module.exports = class Captran {
  constructor (options) {
    if (!options) {
      options = {}
    }
    this.options = options
    this.wmata = new Wmata(options)
    this.dataCache = new Redis(options.ioredis)
    this.debugMode = options.debugMode || true // defaults to true
  }

  remember (params, json, callback) {
    let key = JSON.stringify(params)
    if (this.debugMode) json.captranDebug.cached = true
    this.dataCache.set(key, JSON.stringify(json))
    json.ttl
      ? this.dataCache.expire(key, json.ttl)
      : this.dataCache.expire(key, 60 * 60 * 2) // two hours
    return callback // if
      ? callback(null, json)
      : Promise.resolve(json)
  }

  queryWmata (params, callback) {
    return callback // if
      ? this.wmata.query(params, (error, json) => {
        if (error) callback(error)
        this.remember(params, json, callback)
      }) // else return promise
      : this.wmata.query(params).then(json => this.remember(params, json))
  }

  query (params, callback) {
    let key = JSON.stringify(params)
    return callback
      ? this.dataCache.get(key, (error, result) => {
        if (error) callback(error)
        else if (result) callback(null, result)
        else this.queryWmata(params, callback)
      })
      : this.dataCache.get(key).then(result => result // if not null
        ? Promise.resolve(JSON.parse(result)) // return it as thenable
        : this.queryWmata(params) // else get new results
    )
  }

}
