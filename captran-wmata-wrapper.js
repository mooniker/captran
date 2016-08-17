'use strict'

// dependencies
const request = require('request')
const requestPromise = require('request-promise')
const Bottleneck = require('bottleneck')

module.exports = class WmataWrapper {
    constructor (options, config) {
      // config contains API/endpoint-specific configuration settings
      this.set(config) // set given config to this.config
      // options includes the API key and optional behaviors
      if (!options) {
        options = {}
        console.log(`Using defaults for ${this.config.WRAPPER_NAME} APIs.`)
      } else if (options.debugMode) {
        let optionsCopy = Object.assign({}, options)
        if (optionsCopy.apiKey) {
          optionsCopy.apiKey = '[...]'
        }
        console.log(`${this.config.WRAPPER_NAME} wrapper init options:`, optionsCopy)
      }
      this.API_KEY = options.apiKey || this.config.DEMO_KEY
      this.debugMode = options.debugMode || false
      this.ttl = options.ttl || this.config.TIME_TO_LIVE
      if (!this.API_KEY) {
        console.error(`${this.config.WRAPPER_NAME} API key not supplied.`)
      }
      this.limiter = new Bottleneck(this.config.MAX_CALLS_PER, this.config.INTERVAL)
    }

    set (config) { // set this instance's config to given config
      this.config = config // child classes may overwrite this and assign a specified config
    }

    get realTimeFeeds () { return this.config.REAL_TIME_FEEDS }
    get feed () { return this.config.FEEDS }

    addTimestamp (responseJson) {
      let now = Date.now()
      responseJson.last_updated = now
      for (let i in this.realTimeFeeds) {
        if (responseJson[this.realTimeFeeds[i]]) {
          responseJson.ttl = this.ttl || this.config.TIME_TO_LIVE
          break
        }
      }
      if (this.debugMode) {
        responseJson.captranDebug = {
          debugMode: this.debugMode,
          queryQueueLength: this.queryQueueLength,
          timestamp: now,
          ttl: responseJson.ttl
        }
      }
      return responseJson
    }

    renderQueryUrl (params, apiKey) {
      let url = this.feed[params.api]
      if (!url) {
        throw new Error(`Ohnoes, ${params.api} isn't a valid API`)
      }
      let query = Object.keys(params)
        .filter(key => key !== 'api')
        .map(key => `${key}=${params[key]}`)
        .join('&')
      if (query !== '') query += '&'
      return encodeURI(`${url}?` + query + `${this.config.AUTH_TOKEN_FIELD}=${apiKey || this.API_KEY}`)
    }

    query (params, callback) {
      if (typeof (params) !== 'object' || !params.api) {
        throw new Error(`Ohnoes, invalid query params: ${params}`)
      }
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
        api: 'busPositions'
      })
    }

    get queryQueueLength () {
      return this.limiter.nbQueued()
    }
    get queryQueueIsClear () {
      return this.limiter.check()
    }
}
