'use strict'

const WmataWrapper = require('./captran-wmata-wrapper')
const WmataConfig = require('./captran-wmata-config')

module.exports = class WmataClient extends WmataWrapper {
  set () {
    this.config = WmataConfig
  }
}
