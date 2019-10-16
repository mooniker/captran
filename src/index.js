const {
  WMATA_API_KEY,
  WMATA_BASE_URL = "https://api.wmata.com/"
} = process.env;

const axios = require("axios");

const wrapInHtmlPage = (
  text,
  refreshRateSeconds = 5,
  title = "Next Train"
) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="${refreshRateSeconds}">
    <title>${title}</title>
  </head>
  <body>
    <pre>
    ${text}
    </pre>
  </body>
</html>`;

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

function captran(params) {
  const { apiKey = WMATA_API_KEY, baseURL = WMATA_BASE_URL } = params || {};

  this.http = axios.create({
    baseURL,
    timeout: 2000,
    headers: { api_key: apiKey }
  });

  this.get = {
    StationList: StationList(this.http),
    NextTrains: NextTrains(this.http)
  };
}

module.exports = captran;
