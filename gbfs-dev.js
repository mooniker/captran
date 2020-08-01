const Gbfs = require('./captran-gbfs')

var cabi = new Gbfs({
  gbfsUrl: 'https://gbfs.capitalbikeshare.com/gbfs/gbfs.json'
})

// cabi.dir()
// cabi.getFile('en', 'system_information', (err, json) => {
//   console.log(err || json)
// })

// console.log(cabi.gbfs)
// cabi.gbfs().then(console.log)
// cabi.gbfs((error, result) => {
//   console.log(error || result)
// })

// 38.8977° N, 77.0365°
// cabi.getStationInfo('en', (error, result) => {
//   console.log(error || result)
// })

// cabi.getFile('en', 'station_information').then(console.log)
// cabi.getStationInfo('en').then(console.log)
// cabi.getStationInfo('en', (error, result) => {
//   console.log(error || result)
// })

// cabi.getStationsNear('en', 38.8977, -77.0365, 1).then(result => {
//   console.log(result)
//   console.log('hey')
// })
// console.log('end')

// cabi.getStationsNear('en', 38.8977, -77.0365, 1, (error, result) => {
//   console.log(error || result)
//   // console.log('hey')
// })

cabi.getStationsNear('en', 38.8977, -77.0365, 1).then(stations => {
  console.log(stations.length)
})

// cabi.stations('en').then(results => {
//   console.log(results)
//   console.log('end')
// })
