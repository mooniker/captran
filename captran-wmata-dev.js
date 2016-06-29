const Wmata = require('./captran-wmata')

// shortcut query params for dev

const pentagon = {
  busesNearby: {
    queryType: 'busPositions',
    Lat: 38.8690011,
    Lon: -77.0544217,
    Radius: 500
  },
  stopsNearby: {
    queryType: 'stops',
    Lat: 38.8690011,
    Lon: -77.0544217,
    Radius: 500
  }
}
const lafeyette = {
  busPredictions: {
    queryType: 'stopPredictions',
    StopID: '1001141'
  }
}
const farragutMurrow = {
  busPredictions: {
    queryType: 'stopPredictions',
    StopID: '1001133'
  }
}

class WmataDev extends Wmata {

  // returns a string
  static get DEV () { return 'apple' }

  // functions for testing and dev
  queryBusesNearPentagon (callback) {
    return this.query(pentagon.busesNearby, callback)
  }
  queryStopsNearPentagon (callback) {
    return this.query(pentagon.stopsNearby, callback)
  }
  queryBusPredictionsNearWH (callback) {
    return this.query(lafeyette.busPredictions, callback)
  }
  queryBusPredicctionsNearFarragut (callback) {
    return this.query(farragutMurrow.busPredictions, callback)
  }
  consoleCall (params) {
    this.callWmata(params).then(console.log)
  } // or just throw in console.log as this.query's callback

}

module.exports = WmataDev
