'use strict'

const assert = require('chai').assert
const Wmata = require('../captran-wmata')
let wmata = new Wmata()

describe('WMATA API wrapper class\'s renderQueryUrl method', () => {
  let query = 'stops'
  let params = {
    api: query,
    key1: 'value1',
    key2: 'value2',
    key3: 'value3'
  }
  let testKey = 'abcde'

  it('should return a nice query URL', done => {
    let expectedBaseUrl = 'https://api.wmata.com/Bus.svc/json/' + 'jStops'
    assert.equal(wmata.renderQueryUrl(params, testKey),
      expectedBaseUrl + `?key1=value1&key2=value2&key3=value3&api_key=${testKey}`)
    assert.equal(wmata.renderQueryUrl({
      api: 'busPositions',
      Lat: 38.8690011,
      Lon: -77.0544217,
      Radius: 500
    }, testKey),
      `https://api.wmata.com/Bus.svc/json/jBusPositions?Lat=38.8690011&Lon=-77.0544217&Radius=500&api_key=${testKey}`)
    done()
  })

  it('should render query URLs that have no parameters (except API key)', done => {
    assert.equal(wmata.renderQueryUrl({
      api: 'routes'
    }, testKey), `https://api.wmata.com/Bus.svc/json/jRoutes?api_key=${testKey}`)
    done()
  })

  it('should throw an error if passed an invalid query param', done => {
    assert.throws(() => {
      wmata.renderQueryUrl({
        api: 'ruotes'
      }, testKey)
    }, /Ohnoes/)
    done()
  })
})

describe('WMATA API wrapper class\'s addTimestamp method', () => {
  it('should add a timestamp attribute (`last_updated`) to an object', done => {
    let timeless = wmata.addTimestamp({})
    let now = Date.now()
    assert.isAtLeast(timeless.last_updated, now - 20)
    assert.isAtMost(timeless.last_updated, now + 200)
    if (timeless.captranDebug) {
      assert.isAtLeast(timeless.captranDebug.timestamp, now - 20)
      assert.isAtMost(timeless.captranDebug.timestamp, now + 200)
    }
    done()
  })
  it(`should add a time-to-live (TTL, i.e. expiration age) to JSON data that has real-time data content (such as ${wmata.realTimeFeeds[0]})`, done => {
    let ttlTest = wmata.addTimestamp({ [wmata.realTimeFeeds[0]]: 'stuff' })
    assert.isOk(ttlTest.ttl)
    assert.equal(ttlTest.ttl, wmata.ttl)
    done()
  })
})
