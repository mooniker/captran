'use strict'

const WmataWrapper = require('./captran-wmata-wrapper')
const RideonConfig = require('./captran-rideon-config')

module.exports = class WmataClient extends WmataWrapper {
  set () {
    this.config = RideonConfig
  }
}
