const https = require("https");
const R = require("ramda");
const fs = require("fs");

const millisPerHour = 36e5;
const apiKey = "9pXcw2L5eDHgmG5K";
const baseUrl = "https://api.torn.com/";
const buildUrl = query => `${baseUrl}${query}&key=${apiKey}`;
const getOcUrl = () => buildUrl("faction/CRZY?selections=crimenews");
const getCrimeType = R.cond([
  [R.contains("blackmail", R.__), R.always("blackmail")],
  [R.contains("kidnap", R.__), R.always("kidnap")],
  [R.T, R.always("unkown")]
]);
const crimeTypePlanningTimes = {
  blackmail: { type: "blackmail", planningTimeInHours: 24 },
  kidnap: { type: "kidnap", planningTimeInHours: 48 }
};
const peek = fn => value => {
  console.log(value);
  return fn(value);
};
const getPlanningTimeInHoursByType = R.ifElse(
  R.equals("unkown"),
  R.always(0),
  c => R.path([c, "planningTimeInHours"], crimeTypePlanningTimes)
);
const planningTimeInMinutesByType = R.pipe(
  getPlanningTimeInHoursByType,
  R.multiply(60)
);
const parseCrimesData = R.pipe(
  R.prop("crimenews"),
  R.values,
  R.map(
    R.pipe(
      R.applySpec({
        timestmap: R.prop("timestamp"),
        news: R.prop("news"),
        datetime: R.pipe(R.prop("timestamp"), t => new Date(t * 1000)),
        type: R.pipe(R.prop("news"), getCrimeType),
        planningTimeInHours: R.pipe(
          R.prop("news"),
          getCrimeType,
          getPlanningTimeInHoursByType
        ),
        planningTimeInMinutesByType: R.pipe(
          R.prop("news"),
          getCrimeType,
          planningTimeInMinutesByType
        )
      }),
      crime => {
        const plannedTime = R.prop("datetime", crime);
        const now = new Date();
        const planningHours = R.prop("planningTimeInHours", crime);
        //const dueTime = ;
        const dueDate = new Date(
          new Date(plannedTime).setHours(plannedTime.getHours() + planningHours)
        );
        const hoursUntilDue = (dueDate - new Date()) / millisPerHour;
        return R.merge(crime, {
          dueDate,
          hoursUntilDue
        });
      }
    )
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
