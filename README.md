# captran [![Build Status](https://travis-ci.org/mooniker/captran.svg?branch=master)](https://travis-ci.org/mooniker/captran) [![Dependency Status](https://david-dm.org/mooniker/captran.svg)](https://david-dm.org/mooniker/captran) [![Code Climate](https://codeclimate.com/github/mooniker/captran/badges/gpa.svg)](https://codeclimate.com/github/mooniker/captran) [![Greenkeeper badge](https://badges.greenkeeper.io/mooniker/captran.svg)](https://greenkeeper.io/)

Captran is a transportation API wrapper and bundler for the Washington, D.C., metropolitan area. Extra features include call throttling/scheduling to avoid [429'ing](https://httpstatuses.com/429) (when needed) and caching for performance.

The `captran-wmata` module is a thin wrapper for the [the Washington Metropolitan Area Transit Authority (WMATA) API](https://developer.wmata.com/). Refer to [WMATA's documentation](https://developer.wmata.com/docs/services/) and pass any required or optional parameters as an object, but indicate the API endpoint with a keyword as an `api` property.

```js
const Wmata = require('./captran-wmata')
let wmata = new Wmata()

wmata.query({ // returns a promise
  api: 'busPositions'
}).then(console.log)

// error-first callbacks, if supplied, work just as well
wmata.query({ api: 'busPositions' }, (error, doc) => console.log(error || doc))
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

Use the `captran-gbfs` module as a wrapper for [General Bikeshare Feed Specification](https://github.com/NABSA/gbfs), such as that used by [Capital Bikeshare](https://www.capitalbikeshare.com/) (a bicycle sharing network in the Washington, D.C., area):

```js
const Gbfs = require('./captran-gbfs')
let cabi = new Gbfs({
  gbfsUrl: 'https://gbfs.capitalbikeshare.com/gbfs/gbfs.json'
})

cabi.getStationsNear(38.8977, -77.0365, 0.3).then(console.log, console.error)
```

...should print real-time Cabi station data near the White House:

```json
{
  "last_updated":1481408837,
  "ttl":10,
  "data":[
    {
      "station_id":"83",
      "name":"New York Ave & 15th St NW",
      "short_name":"31222",
      "lat":38.8991,
      "lon":-77.0337,
      "rental_methods":[
        "KEY",
        "CREDITCARD"
      ],
      "capacity":19,
      "eightd_has_key_dispenser":false,
      "num_bikes_available":12,
      "num_bikes_disabled":2,
      "num_docks_available":5,
      "num_docks_disabled":0,
      "is_installed":1,
      "is_renting":1,
      "is_returning":1,
      "last_reported":1481408764,
      "eightd_has_available_keys":false
    },
    {
      "station_id":"349",
      "name":"17th & G St NW",
      "short_name":"31277",
      "lat":38.89841,
      "lon":-77.039624,
      "rental_methods":[
        "KEY",
        "CREDITCARD"
      ],
      "capacity":31,
      "eightd_has_key_dispenser":false,
      "num_bikes_available":3,
      "num_bikes_disabled":2,
      "num_docks_available":26,
      "num_docks_disabled":0,
      "is_installed":1,
      "is_renting":1,
      "is_returning":1,
      "last_reported":1481408820,
      "eightd_has_available_keys":false
    }
  ]
}
```
