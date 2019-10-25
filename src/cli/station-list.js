#!/usr/bin/env node

const makeTable = require("../table");
const Wmata = require("../wmata");
const loadConfig = require("./loadLocalConfig");

const program = require("commander");
program.parse(process.argv);
const lineCode = program.args[0];

main().catch(err => console.error(err.response.data.Message));

async function main() {
  const config = await loadConfig();
  const wmata = new Wmata(config);
  const data = await wmata.get.StationList(lineCode);
  console.log(makeTable(data));
}
