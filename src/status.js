const { table } = require("table");
const chalk = require("chalk");
const wmata = require("./index");
const { DEFAULT_WMATA_STATION_CODE } = process.env;

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

const captran = new wmata({ apiKey: "6b91cd07f734405197c45eac7c146a01" });
captran.get
  .NextTrains(DEFAULT_WMATA_STATION_CODE)
  .then(data => console.log(makeTable(data)));
  
setInterval(() => {
  process.stdout.write("\033c");
  captran.get
    .NextTrains(DEFAULT_WMATA_STATION_CODE)
    .then(data => console.log(makeTable(data)));
}, 30000);
