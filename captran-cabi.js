const Gbfs = require('./captran-gbfs')
const cabi = new Gbfs({
  gbfsUrl: 'https://gbfs.capitalbikeshare.com/gbfs/gbfs.json'
})

module.exports = cabi
