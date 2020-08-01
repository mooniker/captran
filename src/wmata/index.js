const { WMATA_API_KEY, DEFAULT_WMATA_STATION_CODE = "All" } = process.env;

const wmataClient = require("./httpClient");

const StationList = httpClient => LineCode =>
  httpClient
    .get("Rail.svc/json/jStations" + (LineCode ? `?${LineCode}` : ""))
    .then(({ data }) => data);

const NextTrains = httpClient => (...stationCodes) =>
  httpClient
    .get(
      "StationPrediction.svc/json/GetPrediction/" +
        (!stationCodes || stationCodes.length === 0
          ? "All"
          : stationCodes.join(","))
    )
    .then(({ data }) => data);

const NextTrainsByStationName = httpClient => async stationName => {
  const stationList = await StationList(httpClient)();
  const targetStations = stationList.Stations.filter(({ Name }) =>
    Name.toLowerCase().includes(stationName)
  );

  if (targetStations.length === 0) {
    throw new Error("Station not found.");
  }

  if (targetStations.length < 4) {
    // return targetStations[0].Code;
    const stations = targetStations.map(({ Code }) => Code);
    return NextTrains(httpClient)(...stations);
  }

  throw new Error(
    `Found ${targetStations.length} potential matches: ${targetStations
      .map(({ Name }) => Name)
      .join(", ")}`
  );
};

function wmata(params) {
  const { apiKey = WMATA_API_KEY } = params || {};

  if (!apiKey) {
    throw new Error("WMATA API key unspecified.");
  }

  this.http = wmataClient(params);

  this.get = {
    StationList: StationList(this.http),
    NextTrains: NextTrains(this.http),
    NextTrainsByStationName: NextTrainsByStationName(this.http)
  };

  this.setApiKey = apiKey => {
    this.apiKey = apiKey;
  };
}

module.exports = wmata;
