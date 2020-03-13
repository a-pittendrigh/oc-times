const https = require("https");

module.exports = (url, callback) =>
  https
    .get(url, resp => {
      let data = "";
      resp.on("data", chunk => {
        data += chunk;
      });
      resp.on("end", () => {
        return callback(data);
      });
    })
    .on("error", err => {
      console.log("Error: " + err.message);
    });
