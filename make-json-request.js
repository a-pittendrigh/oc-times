const request = require("./make-request");

module.exports = (url, cb) => request(url, d => cb(JSON.parse(d)));
