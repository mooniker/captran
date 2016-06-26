'use strict'

const assert = require('chai').assert

describe('renderQueryUrl', () => {
  const renderQueryUrl = require('../wmata').renderQueryUrl
  let apiKey = 'secret'

  it('should return a nice query string URL', done => {
    let params = {
      url: 'https://test.test/api',
      key1: 'value1',
      key2: 'value2',
      key3: 'value3'
    }
    assert.equal(renderQueryUrl(params, apiKey),
      `https://test.test/api?key1=value1&key2=value2&key3=value3&api_key=secret`)

    assert.equal(renderQueryUrl({
      url: 'https://api.wmata.com/Bus.svc/json/jBusPositions',
      Lat: 38.8690011,
      Lon: -77.0544217,
      Radius: 500
    }, apiKey),
    'https://api.wmata.com/Bus.svc/json/jBusPositions?Lat=38.8690011&Lon=-77.0544217&Radius=500&api_key=secret')

    done() // why is this needed here but not below?
  })
  it('should render query URLs that have no parameters (except API key)', (done) => {
    assert.equal(renderQueryUrl({
      url: 'https://api.wmata.com/Bus.svc/json/jRoutes'
    }, apiKey), 'https://api.wmata.com/Bus.svc/json/jRoutes?api_key=secret')
    done()
  })
})

const wmata = require('../wmata')
const wmataCache = require('../wmata_cache')

describe('WMATA API wrapper', () => {
  it('should have dummy ping function that returns "pong"', done => {
    assert.equal(typeof(wmata.ping()), 'string')
    assert.equal(wmata.ping(), 'pong')
    done()
  })
  it('should have a positions object with functions', done => {
    assert.equal(typeof(wmata.metrobus.positions), 'object')
    done()
  })
  it('should return proper stop name for arrival times near Kościuszko statue', done => {
    wmata.call(wmata.metrobus.arrivalPredictions.atLafeyette).then(result => {
      assert.equal(result.StopName, 'H St + Madison Pl Nw')
      done()
    })
  })
})

describe('WMATA API cache', () => {
  // const wmataCache = require('../wmata_cache')
  // const wmata = require('../wmata')
  it('should have dummy ping function that returns "pong"', done => {
    assert.equal(typeof(wmataCache.ping()), 'string')
    assert.equal(wmataCache.ping(), 'pong')
    done()
  })
  it('should have corresponding functions with the WMATA API wrapper (shallow check)', done => {
    let wrapperKeys = Object.keys(wmata.metrobus)
    let cacheKeys = Object.keys(wmataCache.metrobus)
    assert.deepEqual(wrapperKeys, cacheKeys)
    for (let i = 0; i < wrapperKeys.length; i++) {
      assert.deepEqual(Object.keys(wmata.metrobus[wrapperKeys[i]]), Object.keys(wmataCache.metrobus[cacheKeys[i]]))
    }
    done()
  })
  it('should return the same data as a direct call to WMATA API', () => {
    setTimeout(() => {
      // FIXME
      Promise.all([
        wmata.call(wmata.metrobus.positions.nearPentagon),
        wmataCache.call(wmata.metrobus.positions.nearPentagon),
        // wmata.call(wmata.metrobus.stops.nearPentagon),
        // wmataCache.call(wmata.metrobus.stops.nearPentagon)
      ]).then(results => {
        console.log('RESULTS:', results)
        assert.equal(results[0], results[1])
        assert.equal(results[2], results[3])
        // done()
      }, err => {
        console.log(err)
        // done()
      })
    }, 100)
  })
  it('should return proper stop name for arrival times near Murrow Park (Farragut Square)', () => {
    let query = wmataCache.metrobus.arrivalPredictions.query
    query.StopID = '1001133'
    wmataCache.call(query).then(result => {
      assert.equal(result.StopName, 'Nw H St & 18th St')
      // done()
    })
  })
})
