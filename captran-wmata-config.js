const BASE_URL = 'https://api.wmata.com/'
const BUS_SVC_URL = BASE_URL + 'Bus.svc/json/'
const RAIL_SVC_URL = BASE_URL + 'Rail.svc/json/'
const INCIDENTS_URL = BASE_URL + 'Incidents.svc/json/'

module.exports = {
  WRAPPER_NAME: 'WMATA',

  // WMATA-supplied demo key, note limitations => https://developer.wmata.com/demokey
  DEMO_KEY: '6b700f7ea9db408e9745c207da7ca827', //  used as a fallback if key not supplied

  // According to WMATA, "Default tier sufficient for most casual developers.
  // Rate limited to 10 calls/second and 50,000 calls per day."
  // https://developer.wmata.com/Products

  MAX_CALLS_PER: 10, // cap for concurrent calls within INTERVAL
  INTERVAL: 1000, // in millaseconds

  // API docs say real-time info is updated every 20 to 30 seconds

  TIME_TO_LIVE: 25, // time-to-live default expiration in seconds for real-time info

  REAL_TIME_FEEDS: [
    'BusPositions', // 'busPositions',
    'BusIncidents', // 'busIncidents',
    'Predictions', // 'stopPredictions',
    'ElevatorIncidents', // 'elevatorIncidents',
    'RailIncidents', // 'railIncidents',
    'StationPredictions' // 'stationPredictions'
  ],

  FEEDS: {
    // bus info
    stops: BUS_SVC_URL + 'jStops',
    routeDetails: BUS_SVC_URL + 'jRouteDetails',
    routes: BUS_SVC_URL + 'jRoutes',
    routeSchedule: BUS_SVC_URL + 'jRouteSchedule',
    stopSchedule: BUS_SVC_URL + 'jStopSchedule',

    // real-time bus info
    busPositions: BUS_SVC_URL + 'jBusPositions', // BusPositions
    busIncidents: INCIDENTS_URL + 'BusIncidents',
    stopPredictions: BASE_URL + 'NextBusService.svc/json/jPredictions',

    // metrorail info
    lines: RAIL_SVC_URL + 'jLines',
    stationParking: RAIL_SVC_URL + 'jStationParking',
    path: RAIL_SVC_URL + 'jPath',
    stationEntrances: RAIL_SVC_URL + 'jStationEntrances',
    stationInfo: RAIL_SVC_URL + 'jStationInfo', // made redundant by `stations` endpoint
    stations: RAIL_SVC_URL + 'jStations',
    stationTimes: RAIL_SVC_URL + 'jStationTimes',
    srcStationToDstStationInfo: RAIL_SVC_URL + 'jSrcStationToDstStationInfo',

    // real-time rail info
    elevatorIncidents: INCIDENTS_URL + 'ElevatorIncidents',
    railIncidents: INCIDENTS_URL + 'Incidents',
    stationPredictions: BASE_URL + 'StationPrediction.svc/json/GetPrediction/All'
  },

  AUTH_TOKEN_FIELD: 'api_key'

}
