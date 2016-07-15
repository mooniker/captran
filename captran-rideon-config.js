// http://kb.g-and-o.com/wiki/index.php/Live_Transit_API

const BASE_URL = 'http://rideonrealtime.net/'
const FORMAT = '.json'

module.exports = {
  WRAPPER_NAME: 'MoCo (Md.) Ride On',

  // using WMATA's contraints for now
  MAX_CALLS_PER: 10, // cap for concurrent calls within INTERVAL
  INTERVAL: 1000, // in milliseconds
  TIME_TO_LIVE: 25, // time-to-live default expiration in seconds for real-time info

  REAL_TIME_FEEDS: [
    'vehiclePositions'
  ],

  FEEDS: {
    // real-time bus info
    vehiclePositions: BASE_URL + 'vehicle_positions' + FORMAT
  },

  AUTH_TOKEN_FIELD: 'auth_token'

}
