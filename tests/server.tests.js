'use strict'

const supertest = require('supertest')

var server = require('../server')

describe('basic http server', () => {
  it('should respond to GET /ping with JSON-packaged "pong"', done => supertest(server)
    .get('/ping')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(JSON.stringify({ 'body': 'pong' }), done))

  it('should respond to GET /foo with 404 error', done => supertest(server)
    .get('/foo')
    .expect(404, done))
})
