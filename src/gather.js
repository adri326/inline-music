const fs = require("fs");
const path = require("path");

module.exports = function gather(uri) {
  uri = path.resolve(process.cwd(), uri);

  if (fs.lstatSync(uri).isDirectory()) {
    let filepaths = fs.readdirSync(uri).filter((f) => path.extname(f) === ".ipart");
    if (filepaths.includes("main.ipart")) {
      let obj = {};
      filepaths.forEach((f) => {
        let file = fs.readFileSync(path.join(uri, f), "utf8");
        obj[path.basename(path.join(uri, f), ".ipart")] = readLines(file);
      });
      return obj;
    }
    else throw new Error("No main.ipart file in directory: " + uri);
  } else if (fs.lstatSync(uri).isFile()) {
    if (path.extname(uri) === ".ipart") {
      let file = fs.readFileSync(args._[0], "utf8");
      return {
        [path.basename(uri, ".ipart")]: readLines(file)
      };
    } else throw new Error("Unrecognized file: " + uri);
  }
}

function readLines(file) {
  return file.split("\n").map((v, i) => [v, i]).filter(([v, i]) => v);
}
