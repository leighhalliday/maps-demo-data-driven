const fs = require("fs");
const { parse } = require("csv-parse");

const zones = {};

fs.createReadStream("./raw/zones.csv")
  .pipe(parse({ delimiter: "," }))
  .on("data", (row) => {
    zones[row[0]] = row[1];
  })
  .on("end", () => {
    fs.writeFileSync("./raw/zones.json", JSON.stringify(zones));
  });
