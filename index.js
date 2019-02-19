#! node

const fs = require("fs");
const colors = require("colors/safe");

const gather = require("./src/gather");
const parser = require("./src/parser");
const midi = require("./src/midi");

const args = require("yargs")
  .usage("$0 [options] <input> <output>")
  .usage("$0 --stdout [options] <input>")
  .options({
    stdout: {
      describe: "Output the result to stdout instead of a file",
      type: "boolean"
    },
    verbose: {
      alias: "v",
      describe: "Verbose mode, used for debugging",
      type: "boolean"
    },
    midi: {
      describe: "MIDI Mode: output as the MIDI format",
      type: "boolean"
    },
    "no-color": {
      alias: "no-colors",
      describe: "Disables the happy, friendly colors",
      type: "boolean"
    }
  })
  .argv;

let verbose = args.verbose || args.v;

let pass = "main";

try {
  if (args.stdout) {
    if (args._.length < 1) throw new Error("Not enough arguments given! See command usage using --help");
    pass = "gather";
    let gathered = gather(args._[0]);
    pass = "parse";
    let obj = parser(gathered, false);
    if (args.midi) {
      pass = "output: midi";
      midi(obj).stdout();
    }
  } else {
    if (args._.length < 2) throw new Error("Not enough arguments given! See command usage using --help");
    let output = args._[1];

    console.log("Gathering...");
    pass = "gather";
    let gathered = gather(args._[0]);
    console.log(colors.green(`Successfully gathered the files!`));

    console.log("Parsing...");
    pass = "parse";
    let obj = parser(gathered, !!args.verbose);
    console.log(colors.green(`Successfully parsed!`));

    if (args.midi) {
      console.log("Writing as MIDI file...");
      pass = "output: midi";
      fs.writeFileSync(output, midi(obj).buildFile());
      console.log(colors.green("Successfully wrote to file!"));
    }
  }
} catch (err) {
  console.error(colors.red(`Error at the '${pass}' pass:`));
  console.error(`(${colors.grey(err.name)}) ${err.message}`);
  console.error();
  if (verbose) console.error(colors.grey(err.stack));
  process.exit(1);
}
