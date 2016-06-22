'use strict'

const assert = require('chai').assert

// const renderUriWithParams = require('../wmata').renderUriWithParams
// const renderParams = require(helpers.renderParamsForUri)

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

describe('WMATA API wrapper', function () {

  const wmata = require('../wmata')
  it('should have dummy ping function', () => {
    assert.equal(typeof(wmata.ping()), 'object')
    assert.equal(wmata.ping().body, 'pong')
  })
})
