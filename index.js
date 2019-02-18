#! node
const args = require("yargs").argv;
const fs = require("fs");

const gather = require("./src/gather");
const parser = require("./src/parser");
const midi = require("./src/midi");

if (args.o) {
  console.log("Gathering...");

  let gathered = gather(args._[0]);
  // let file = fs.readFileSync(args._[0], "utf8");
  // let lines = file.split("\n").map((v, i) => [v, i]).filter(([v, i]) => v);

  console.log("Parsing...");
  let obj = parser(gathered, !!args.verbose);

  console.log("Successfully parsed!");

  // console.log(obj);
  // console.log(obj.scores.main.measures[0].notes[0]);
  // obj.measures[1].notes.forEach((n) => console.log(n));

  // console.log(midi(obj).buildFile());

  if (args.midi) {
    console.log("Writing as MIDI file...");
    fs.writeFileSync(args.o, midi(obj).buildFile());
    console.log("Successfully wrote to file!");
  }
}
// else {
//   let file = fs.readFileSync(args._[0], "utf8");
//   let lines = file.split("\n").map((v, i) => [v, i]).filter(([v, i]) => v);
//   let obj = parser(lines);
//   if (args.midi) {
//     midi(obj).stdout();
//   }
// }
