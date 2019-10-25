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
    case "YL":
      return chalk.black.bgYellow(text);
    default:
      return text;
  }
};

const makeTable = (data, params) => {
  const {
    hide = [
      "Destination",
      "DestinationCode",
      "Group",
      "Location",
      "LocationCode",
      "Address",
      "Lat",
      "Lon"
    ],
    translate = {
      DestinationName: "Destination",
      LocationName: "Location"
    },
    join = ["StationTogether", "LineCode"]
  } = params || {};

  const joins = {};

  if (Array.isArray(data)) {
    const hiddenIdxes = [];

    const heads = Object.keys(data[0])
      .filter((key, idx) => {
        const replacer = key.replace(/\d/, "");
        if (join.includes(replacer)) {
          joins[replacer] = joins[replacer] || [];
          joins[replacer].push(idx);
          if (key.endsWith("1")) {
            return true;
          } else {
            hiddenIdxes.push(idx);
            return false;
          }
        }
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

    const filtered = data.map(row =>
      Object.values(row)
        .map((cell, idx, arr) => {
          const keys = Object.keys(joins);
          for (const key of keys) {
            if (idx === joins[key][0]) {
              const joined = joins[key]
                .map(i => arr[i])
                .filter(i => i)
                .join(" ");
              return joined;
            }
          }
          return cell;
        })
        .filter((cell, idx) => !hiddenIdxes.includes(idx))
        .map(cellText =>
          typeof cellText === "string"
            ? cellText.replace(/\b\w\w\b/g, addColorIfNeeded)
            : cellText
        )
    );

    const myTable = table([heads].concat(filtered));
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

module.exports = makeTable;
