# captran [![Build Status](https://travis-ci.org/mooniker/captran.svg?branch=master)](https://travis-ci.org/mooniker/captran) [![Dependency Status](https://david-dm.org/mooniker/captran.svg)](https://david-dm.org/mooniker/captran) [![Code Climate](https://codeclimate.com/github/mooniker/captran/badges/gpa.svg)](https://codeclimate.com/github/mooniker/captran)

Captran is a transportation API wrapper and bundler for the Washington, D.C., metropolitan area. Extra features include call throttling/scheduling to avoid [429'ing](https://httpstatuses.com/429) (when needed) and caching for performance.

The `captran-wmata` module is a thin wrapper for the [the Washington Metropolitan Area Transit Authority (WMATA) API](https://developer.wmata.com/). Refer to [WMATA's documentation](https://developer.wmata.com/docs/services/) and pass any required or optional parameters as an object, but indicate the API endpoint with a keyword as an `api` property.

```js
const Wmata = require('./captran-wmata')
let wmata = new Wmata()

wmata.query({ // returns a promise
  api: 'busPositions'
}).then(console.log)

// conventional callbacks, if supplied, work just as well
wmata.query({ api: 'busPositions' }, (error, doc) => {
  console.log(error || doc)
})
```

...fetches for you all the JSON with which you may do as you please.

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

For real-time position information for buses in Maryland's Montgomery County, the `captran-rideon` module can be used in much the same way:

```js
const RideOn = require('./captran-rideon')
let rideon = new RideOn({ apiKey: 'auth_token_goes_here' })

rideon.query({ // returns a promise
  api: 'busPositions'
}).then(console.log)
```
