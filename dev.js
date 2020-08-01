const CapTran = require('./captran')
var captran = new CapTran()
let params = {
  api: 'busPositions'
}
var tail = obj => {
  console.log(obj.captranDebug)
}
captran.query(params).then(tail)
captran.query(params).then(tail)
