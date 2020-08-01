const Transit = require('transportation')
let dca = new Transit()

// const wmataGtfs = 'https://lrg.wmata.com/GTFS_data/google_transit.zip'
const wmataGtfs = 'https://lrg.wmata.com/GTFS_data'
const artGtfs = 'http://realtime.commuterpage.com/rtt/public/utility'
let konsole = require('transportation/console')

// import GTFS data
dca.importGTFS(artGtfs, err => {
  // have a look at the Transit instance
  if (err) console.error(err)
  konsole(dca)
})

dca.importGTFS(wmataGtfs, err => {
  if (err) console.error(err)
  konsole(dca)
})
