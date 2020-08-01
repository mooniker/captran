#!/usr/bin/env node

const makeTable = require("../table");
const Wmata = require("../wmata");
const loadConfig = require("./loadLocalConfig");

const program = require("commander");
program
  .option("-i, --set-interval [interval]", "Set update interval in seconds")
  .parse(process.argv);
const stationCodes = program.args;

main(stationCodes, program.interval).catch(err => console.error(err.response));

async function main(stationCodes, interval) {
  const config = await loadConfig();
  const wmata = new Wmata(config);
  let data;

  if (stationCodes[0] && !stationCodes[0].match(/\w\d\d/)) {
    data = await wmata.get.NextTrainsByStationName(stationCodes.join(" "));
  } else {
    data = await wmata.get.NextTrains(...stationCodes);
  }

  console.log(makeTable(data));
}
