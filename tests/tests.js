'use strict'

const assert = require('chai').assert

describe('renderUriWithParams helper function', function () {
  const renderUriWithParams = require('../wmata').renderUriWithParams

  it('should return a nice query string URL', function (done) {
    let testBaseUri = 'https://test.test/api'
    let secret = 'secret'
    assert.equal(renderUriWithParams(testBaseUri, {
      'key1': 'value1',
      'key2': 'value2',
      'key3': 'value3'
    }, secret), `${testBaseUri}?key1=value1&key2=value2&key3=value3&api_key=${secret}`)
    assert.equal(renderUriWithParams('https://api.wmata.com/Bus.svc/json/jBusPositions', {
      Lat: 38.8690011,
      Lon: -77.0544217,
      Radius: 500
    }, 'abcdefg'),
    'https://api.wmata.com/Bus.svc/json/jBusPositions?Lat=38.8690011&Lon=-77.0544217&Radius=500&api_key=abcdefg')

    done() // why is this needed here but not below?
  })
  it('should discard params whose value is null', () => {
    let testBaseUri = 'https://dev.whatever.test/api'
    let secret = 'password123'
    assert.equal(renderUriWithParams(testBaseUri, {
      'key1': 'value1',
      'key2': 'value2',
      'key3': null
    }, secret), `${testBaseUri}?key1=value1&key2=value2&api_key=${secret}`)
  })
})
describe('renderQueryUrl', () => {
  const renderQueryUrl = require('../wmata').renderQueryUrl

  it('should return a nice query string URL', function (done) {
    let params = {
      url: 'https://test.test/api',
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
      api_key: 'secret'
    }
    assert.equal(renderQueryUrl(params),
      `https://test.test/api?key1=value1&key2=value2&key3=value3&api_key=secret`)

    assert.equal(renderQueryUrl({
      url: 'https://api.wmata.com/Bus.svc/json/jBusPositions',
      Lat: 38.8690011,
      Lon: -77.0544217,
      Radius: 500,
      api_key: 'abcdefg'
    }),
    'https://api.wmata.com/Bus.svc/json/jBusPositions?Lat=38.8690011&Lon=-77.0544217&Radius=500&api_key=abcdefg')

    assert.equal(renderQueryUrl({
      url: 'https://api.wmata.com/Bus.svc/json/jRoutes',
      api_key: 'secret'
    }), 'https://api.wmata.com/Bus.svc/json/jRoutes?api_key=secret')

    done() // why is this needed here but not below?
  })
})

const wmata = require('../wmata')
const wmataCache = require('../wmata_cache')

describe('WMATA API wrapper', function () {
  it('should have dummy ping function that returns "pong"', () => {
    assert.equal(typeof(wmata.ping()), 'string')
    assert.equal(wmata.ping(), 'pong')
  })
  it('should have a positions object with functions', () => {
    assert.equal(typeof(wmata.metrobus.positions), 'object')
  })
  it('should return proper stop name for arrival times near Kościuszko statue', () => {
    wmata.metrobus.arrivalPredictions.atLafeyette().then(result => {
      assert.equal(result.StopName, 'H St + Madison Pl Nw')
      done()
    })
  })
})
//
// describe('WMATA API cache', () => {
//   // const wmataCache = require('../wmata_cache')
//   // const wmata = require('../wmata')
//   it('should have dummy ping function that returns "pong"', () => {
//     assert.equal(typeof(wmataCache.ping()), 'string')
//     assert.equal(wmataCache.ping(), 'pong')
//   })
//   it('should have corresponding functions with the WMATA API wrapper (shallow check)', () => {
//     let wrapperKeys = Object.keys(wmata.metrobus)
//     let cacheKeys = Object.keys(wmataCache.metrobus)
//     assert.deepEqual(wrapperKeys, cacheKeys)
//     for (let i = 0; i < wrapperKeys.length; i++) {
//       assert.deepEqual(Object.keys(wmata.metrobus[wrapperKeys[i]]), Object.keys(wmataCache.metrobus[cacheKeys[i]]))
//     }
//   })
//   it('should return the same data as a direct call to WMATA API', () => {
//     setTimeout(() => {
//       Promise.all([
//         wmata.metrobus.positions.nearPentagon(),
//         wmataCache.metrobus.positions.nearPentagon(),
//         wmata.metrobus.stops.nearPentagon(),
//         wmataCache.metrobus.stops.nearPentagon()
//       ]).then(results => {
//         assert.equal(results[0], results[1])
//         assert.equal(results[2], results[3])
//         done()
//       })
//     }, 20000)
//   })
//   it('should return proper stop name for arrival times near Kościuszko statue', () => {
//     wmataCache.metrobus.arrivalPredictions.atLafeyette().then(result => {
//       assert.equal(result.StopName, 'H St + Madison Pl Nw')
//       done()
//     })
//   })
// })
