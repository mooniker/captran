# captran [![Build Status](https://travis-ci.org/mooniker/captran.svg?branch=master)](https://travis-ci.org/mooniker/captran) [![Dependency Status](https://david-dm.org/mooniker/captran.svg)](https://david-dm.org/mooniker/captran) [![Code Climate](https://codeclimate.com/github/mooniker/captran/badges/gpa.svg)](https://codeclimate.com/github/mooniker/captran)

Captran is a Node.js wrapper for [the Washington Metropolitan Area Transit Authority (WMATA) API](https://developer.wmata.com/). Extra features include call throttling/scheduling to avoid [429'ing](https://httpstatuses.com/429) on WMATA's server and caching for performance.

The `captran-wmata` module is a thin wrapper. Refer to [the WMATA documentation](https://developer.wmata.com/docs/services/) and pass any required or optional parameters as an object, but indicate the API endpoint with a keyword as an `api` property.

```js
const Wmata = require('./captran-wmata')
var wmata = new Wmata()

wmata.query({
  api: 'busPositions'
}).then(console.log)
```

...fetches for you all the JSON...

```json
{
  "BusPositions":[  
    {  
      "VehicleID":"7077",
      "Lat":38.955383,
      "Lon":-76.744362,
      "Deviation":-1,
      "DateTime":"2016-06-29T18:07:07",
      "TripID":"8860264",
      "RouteID":"B24",
      "...":"etc",
    },{
      "all the other buses":"and their deets"
    }
  ]
}
```

...with which you may do as you please.
