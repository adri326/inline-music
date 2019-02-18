const fs = require("fs");
const path = require("path");

let uri = path.resolve(__dirname, "../functions");

let files = fs.readdirSync(uri);

for (let file of files) {
  file = path.basename(file, ".js");
  module.exports[file] = require(path.resolve(__dirname, "../functions", file));
}
