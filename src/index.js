const {
  WMATA_API_KEY,
  WMATA_BASE_URL = "https://api.wmata.com/"
} = process.env;

const axios = require("axios");
const { table } = require("table");
const chalk = require("chalk");

const addColorIfNeeded = text => {
  switch (text) {
    case "1":
    case "ARR":
    case "BRD":
      return chalk.red(text);
    case "2":
    case "3":
    case "4":
    case "5":
      return chalk.yellow(text);
    case "OR":
      return chalk.black.bgKeyword("orange")(text);
    case "SV":
      return chalk.black.bgWhite(text);
    case "RD":
      return chalk.black.bgRed(text);
    case "GR":
      return chalk.black.bgGreen(text);
    case "BL":
      return chalk.black.bgBlue(text);
    default:
      return text;
  }
};

const makeTable = (data, params) => {
  const {
    hide = ["Destination", "DestinationCode", "Group", "LocationCode"],
    translate = {
      DestinationName: "Destination",
      LocationName: "Location"
    }
  } = params || {};
  if (Array.isArray(data)) {
    const hiddenIdxes = [];

    const heads = Object.keys(data[0])
      .filter((key, idx) => {
        if (!hide.includes(key)) {
          return true;
        }
        hiddenIdxes.push(idx);
      })
      .map(key => {
        if (Object.keys(translate).includes(key)) {
          return translate[key];
        }
        return key;
      });

    const myTable = table(
      [heads].concat(
        data.map(row =>
          Object.values(row)
            .filter((cell, idx) => !hiddenIdxes.includes(idx))
            .map(addColorIfNeeded)
        )
      )
    );
    return myTable;
  }
  const [firstKey] = Object.keys(data);
  return (
    firstKey +
    " (" +
    new Date().toLocaleTimeString() +
    "):\n" +
    makeTable(data[firstKey])
  );
};

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

module.exports = wmata;
