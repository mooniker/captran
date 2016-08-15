'use strict'

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
    // stops: {
    //   url: BUS_SVC_URL + 'jStops',
    //   jsonHeaderKey: 'Stops'
    // },
    routeDetails: BUS_SVC_URL + 'jRouteDetails',
    // routeDetails: {
    //   url: BUS_SVC_URL + 'jRouteDetails',
    //   jsonHeaderKey: null // no header
    // },
    routes: BUS_SVC_URL + 'jRoutes',
    // routes: {
    //   url: BUS_SVC_URL + 'jRoutes',
    //   jsonHeaderKey: 'Routes'
    // },
    routeSchedule: BUS_SVC_URL + 'jRouteSchedule',
    // routeSchedule: {
    //   url: BUS_SVC_URL + 'jRouteSchedule',
    //   jsonHeaderKey: null
    // },
    stopSchedule: BUS_SVC_URL + 'jStopSchedule',
    // stopSchedule: {
    //   url: BUS_SVC_URL + 'jStopSchedule',
    //   jsonHeaderKey: null
    // },

    // real-time bus info
    busPositions: BUS_SVC_URL + 'jBusPositions', // BusPositions
    // busPositions: {
    //   url: BUS_SVC_URL + 'jBusPositions',
    //   jsonHeaderKey: 'BusPositions',
    //   realTime: true
    // },
    busIncidents: INCIDENTS_URL + 'BusIncidents',
    // busIncidents: {
    //   url: INCIDENTS_URL + 'BusIncidents',
    //   jsonHeaderKey: 'BusIncidents',
    //   realTime: true
    // },
    stopPredictions: BASE_URL + 'NextBusService.svc/json/jPredictions',
    // stopPredictions: {
    //   url: BASE_URL + 'NextBusService.svc/json/jPredictions',
    //   jsonHeaderKey: 'Predictions',
    //   realTime: true
    // },

    // metrorail info
    lines: RAIL_SVC_URL + 'jLines',
    // lines: {
    //   url: RAIL_SVC_URL + 'jLines',
    //   jsonHeaderKey: 'Lines',
    // },
    stationParking: RAIL_SVC_URL + 'jStationParking',
    // stationParking: {
    //   url: RAIL_SVC_URL + 'jStationParking',
    //   jsonHeaderKey: 'StationParking'
    // },
    path: RAIL_SVC_URL + 'jPath',
    // path: {
    //   url: RAIL_SVC_URL + 'jPath',
    //   jsonHeaderKey: 'Path'
    // }
    stationEntrances: RAIL_SVC_URL + 'jStationEntrances',
    // stationEntrances: {
    //   url: RAIL_SVC_URL + 'jStationEntrances',
    //   jsonHeaderKey: 'StationEntrances'
    // },
    stationInfo: RAIL_SVC_URL + 'jStationInfo', // made redundant by `stations` endpoint
    // stationInfo: { // maybe this should be dropped
    //   url: RAIL_SVC_URL + 'jStationInfo',
    //   jsonHeaderKey: 'StationInfo'
    // },
    stations: RAIL_SVC_URL + 'jStations',
    // stations: {
    //   url: RAIL_SVC_URL + 'jStations',
    //   jsonHeaderKey: 'Stations'
    // },
    stationTimes: RAIL_SVC_URL + 'jStationTimes',
    // stationTimes: {
    //   url: RAIL_SVC_URL + 'jStationTimes',
    //   jsonHeaderKey: 'StationTimes'
    // },
    srcStationToDstStationInfo: RAIL_SVC_URL + 'jSrcStationToDstStationInfo',
    // srcStationToDstStationInfo: {
    //   url: RAIL_SVC_URL + 'jSrcStationToDstStationInfo',
    //   jsonHeaderKey: 'srcStationToDstStationInfo' // ?
    // },

    // real-time rail info
    elevatorIncidents: INCIDENTS_URL + 'ElevatorIncidents',
    // elevatorIncidents: {
    //   url: INCIDENTS_URL + 'ElevatorIncidents',
    //   jsonHeaderKey: 'ElevatorIncidents',
    //   realTime: true
    // },
    railIncidents: INCIDENTS_URL + 'Incidents',
    // railIncidents: {
    //   url: INCIDENTS_URL + 'Incidents',
    //   jsonHeaderKey: 'Incidents',
    //   realTime: true
    // },
    stationPredictions: BASE_URL + 'StationPrediction.svc/json/GetPrediction/All'
    // stationPredictions: {
    //   url: BASE_URL + 'StationPrediction.svc/json/GetPrediction/All',
    //   jsonHeaderKey: 'StationPrediction',
    //   realTime: true
    // }
  },

  AUTH_TOKEN_FIELD: 'api_key'

}
