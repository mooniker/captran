const DEFAULT_CONFIG_FOLDER_NAME = ".captran";
const DEFAULT_WMATA_CONFIG_FILENAME = "wmata.json";

const homedir = require("os").homedir();
const { join } = require("path");
const { promisify } = require("util");
const { access, readdir, readFile } = require("fs");
const readDir = promisify(readdir);
const read = promisify(readFile);

const configPaths = [homedir, DEFAULT_CONFIG_FOLDER_NAME];

const getLocalConfig = async () => {
  const dir = await readDir(join(...configPaths)).catch(err => {
    if (err.code === "ENOENT") {
      return false;
    }

    console.warn(err.message);
    return null;
  });

  const config = {};

  for (const filename of dir.filter(fname => fname.endsWith(".json"))) {
    const [confName] = filename.split(".json");
    const confValue = await read(join(...configPaths, filename)).catch(err => {
      if (err.code !== "EISDIR") {
        console.warn(err.message);
      }
      return undefined;
    });

    config[confName] = JSON.parse(confValue);
  }

  return config;
};

module.exports = getLocalConfig;
