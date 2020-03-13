const https = require("https");
const R = require("ramda");
const fs = require("fs");

const apiKey = "9pXcw2L5eDHgmG5K";
const baseUrl = "https://api.torn.com/";
const buildUrl = query => `${baseUrl}${query}&key=${apiKey}`;
const getOcUrl = () => buildUrl("faction/CRZY?selections=crimenews");
const parseCrimesData = R.pipe(
  R.prop("crimenews"),
  R.values,
  R.map(
    R.applySpec({
      timestmap: R.prop("timestamp"),
      news: R.prop("news"),
      datetime: R.pipe(R.prop("timestamp"), t => new Date(t * 1000)),
      type: R.pipe(
        R.prop("news"),
        R.cond([
          [R.contains("blackmail", R.__), R.always("blackmail")],
          [R.T, R.always("unkownn")]
        ])
      )
    })
  ),
  v => console.log(v)
);
const getOrganisedCrimes = () =>
  https
    .get(getOcUrl(), resp => {
      let data = "";

      // A chunk of data has been recieved.
      resp.on("data", chunk => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resp.on("end", () => {
        console.log(JSON.parse(data));
        fs.appendFile("crimes.json", data, function(err) {
          if (err) throw err;
          console.log("Saved!");
        });
        parseCrimesData(JSON.parse(data));
      });
    })
    .on("error", err => {
      console.log("Error: " + err.message);
    });

console.log(getOcUrl());
console.log(getOrganisedCrimes());
