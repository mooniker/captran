'use strict'

const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const Schema = mongoose.Schema

const WmataBusStopSchema = new Schema({
  name: String,
  stopId: String,
  loc: {
    type: [Number],
    index: '2d'
  },
  routes: [String]
})

module.exports = {
  busStopModel: mongoose.model('WmataBusStop', WmataBusStopSchema)
}
