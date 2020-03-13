const R = require("ramda");
const fs = require("fs");

const getParticipantsFromNews = require("./participants");
const requestJson = require("./make-json-request");
// replace require("./apikey") with key in the string
const apiKey = require("./apikey") || "YOUR_KEY_GOES_HERE";

const millisPerHour = 36e5;
const baseUrl = "https://api.torn.com/";
const buildUrl = query => `${baseUrl}${query}&key=${apiKey}`;
const OcUrl = buildUrl("faction/CRZY?selections=crimenews");
const getCrimeType = R.cond([
  [R.contains("blackmail", R.__), R.always("blackmail")],
  [R.contains("kidnap", R.__), R.always("kidnap")],
  [R.T, R.always("unkown")]
]);
const crimeTypePlanningTimes = {
  blackmail: { type: "blackmail", planningTimeInHours: 24 },
  kidnap: { type: "kidnap", planningTimeInHours: 48 }
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
        plannedTime: R.pipe(R.prop("timestamp"), t => new Date(t * 1000)),
        type: R.pipe(R.prop("news"), getCrimeType),
        planningTimeInHours: R.pipe(
          R.prop("news"),
          getCrimeType,
          getPlanningTimeInHoursByType
        ),
        planningTimeInMinutes: R.pipe(
          R.prop("news"),
          getCrimeType,
          planningTimeInMinutesByType
        ),
        participants: data => getParticipantsFromNews(data.news)
      }),
      crime => {
        const plannedTime = R.prop("plannedTime", crime);
        const now = new Date();
        const planningHours = R.prop("planningTimeInHours", crime);
        const dueDate = new Date(
          new Date(plannedTime).setHours(plannedTime.getHours() + planningHours)
        );
        const hoursUntilDue = (dueDate - now) / millisPerHour;
        return R.merge(crime, {
          dueDate,
          hoursUntilDue
        });
      },
      crime =>
        R.merge(crime, {
          remaining: `${Math.floor(crime.hoursUntilDue)} hour(s) ${Math.floor(
            (crime.hoursUntilDue - Math.floor(crime.hoursUntilDue)) * 60
          )} minute(s)`
        })
    )
  ),
  R.filter(crime => crime.dueDate > new Date()),
  crimes => {
    console.log("Crimes planned: ", crimes.length);
    return crimes;
  },
  crimes =>
    fs.writeFile("crimes.json", JSON.stringify(crimes), function(err) {
      if (err) throw err;
      console.log("Saved!");
    })
);
const getOrganisedCrimes = () => requestJson(OcUrl, parseCrimesData);

getOrganisedCrimes();
