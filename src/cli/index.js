#!/usr/bin/env node

const program = require("commander");
const version = require("../../package.json").version;

program
  .version(version)
  .command("station-list [LineCode]", "List stations", {
    executableFile: "station-list"
  })
  .alias("ls")
  .command("next-trains [StationCodes]", "List next train arrivals", {
    executableFile: "next-trains"
  })
  .alias("next")
  .parse(process.argv);
