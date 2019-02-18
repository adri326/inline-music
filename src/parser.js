const functions = require("./functions");
const Note = require("./note");
const Time = require("./time");


module.exports = function parser(gathered, verbose) {
  let glob = {};
  let parsed = {};
  if (verbose) console.log();
  Object.entries(gathered).forEach(([name, lines]) => {
    if (verbose) {
      console.log(`-> Track '${name}'`);
      console.log();
    }
    parsed[name] = parseFile(lines, name === "main" || gathered.length === 1, glob, verbose);
    if (verbose) console.log();
  });
  return {
    ...glob,
    scores: parsed
  };
};

function parseFile(lines, main, glob, verbose) {
  let parsed = {
    measures: [
      {notes: []}
    ]
  };

  let position = 0;
  let lastNotePosition = 0;

  function parseLine(line, index, sub = false) {
    let expanded = expand(line, index, glob);
    if (verbose) {
      console.log(`${sub ? " ^--" : ""} (${index}): ${expanded}`);
    }
    let keywords = expanded.split(/ |\n/g).filter(Boolean);
    switch (keywords[0]) {
      case "measure":
        if (!main) throw ERROR.notMain(index);
        if (!keywords[1]) throw ERROR.notEnoughArguments(index, 1, keywords.length - 1);

        let split = keywords[1].split("/").map(Number);
        if (split.length != 2 || isNaN(split[0]) || split[0] <= 0 || isNaN(split[1]) || split[1] <= 0) {
          throw ERROR.invalidArgument(index, keywords[1]);
        }
        glob.measure = split;

        break;
      case "tempo":
        if (!main) throw ERROR.notMain(index);
        if (!keywords[1]) throw ERROR.notEnoughArguments(index, 1, keywords.length - 1);

        let tempo = Number(keywords[1]);
        if (isNaN(tempo) || tempo <= 0) {
          throw ERROR.invalidArgument(index, keywords[1]);
        }
        glob.tempo = tempo;

        break;
      case "at":
        if (keywords.length <= 5) throw ERROR.notEnoughArguments(index, "> 4", keywords.length - 1);
        if (keywords[2] != "for") throw Error.invalidArgument(index, keywords[2]);
        if (keywords[4] != "-") throw Error.invalidArgument(index, keywords[4]);

        let pos = parseTime(index, keywords[1]);
        let length = parseTime(index, keywords[3]);
        let notes = keywords.slice(5).map((raw) => new Note(raw));

        if (pos.toBeats(glob) < lastNotePosition) {
          throw new Error(`Invalid note position at line ${index}: note is before the last one`);
        }

        lastNotePosition = pos.toBeats(glob) + length.toBeats(glob);

        if (lastNotePosition > glob.measure[0]) {
          throw new Error(`Note overruns measure at line ${index}`);
        }

        parsed.measures[position].notes.push({
          position: pos,
          length,
          pitch: notes
        });

        break;
      case "next":
        if (keywords.length != 2) throw ERROR.notEnoughArguments(index, 1, keywords.length - 1);
        switch (keywords[1]) {
          case "measure":
            parsed.measures.push({
              notes: []
            });
            position++;
            lastNotePosition = 0;
            break;
        }
        break;
      case "~":
        // console.log(keywords);
        let _lines = expanded.slice(1).split("\n").filter(Boolean);
        _lines.forEach((_line) => {
          parseLine(_line, index, true);
        });
        break;

      case "//":
        // comments
        break;
      default:
        // console.log(">", keywords);
        // throw new Error(`Unrecognized keyword at line ${index}: ${keywords[0]}`);
    }
  }

  for (let [line, index] of lines) {
    parseLine(line, index);
  }

  return parsed;
}

function checkPreludeWritten(obj) {
  return obj.measures[0] && obj.measures[0].measure && obj.tempo;
}

function parseTime(index, raw) {
  let elements = raw.split(".").map((v) => v ? Number(v) : 0);
  elements.forEach((e) => {
    if (isNaN(e)) throw ERROR.invalidArgument(index, raw);
  });
  return new Time(elements);
}

function _expand(line, index) {
  function sub(char = 0) {
    let regexp = /\b(\w+)\(/g;
    regexp.lastIndex = char;
    let fn = regexp.exec(line);
    if (fn) {
      let [content, nchar] = sub(fn.index + fn[0].length);
      return [line.slice(0, fn.index) + functions[fn[1]](content.split(" ").filter(Boolean), index) + line.slice(nchar), nchar];
    }
    regexp = /\)/g;
    regexp.lastIndex = char;
    fn = regexp.exec(line);
    if (fn) {
      return [line.slice(char, fn.index), fn.index + 1];
    }
    else return [line.slice(char), line.length];
  }
  console.log(sub(0)[0]);
  return sub(0)[0];
}

function expand(line, index, glob) {
  function sub(text, depth = 1) {
    let regexp = /\b(\w+)\(|\)/;
    let fn;
    let res = "";
    let length = 0;
    while (fn = regexp.exec(text)) {
      res += text.slice(0, fn.index);
      if (fn[1]) {
        let [content, nchar] = sub(text.slice(fn.index + fn[0].length), depth + 1);

        if (functions[fn[1]]) {
          res += functions[fn[1]](content.split(" ").filter(Boolean), index, glob);
        } else throw new Error(`Unknown function ${fn[1]} at line ${index}`);

        // now we trim!
        text = text.slice(fn.index + fn[0].length + nchar);
        length += fn.index + fn[0].length + nchar;
      } else {
        length += fn.index;
        return [res, length];
      }
    }

    return [res + text, length + text.length];
  }
  return sub(line)[0];
}


const ERROR = {
  invalidArgument: function(index, arg) {
    return new Error(`Invalid argument at line ${index}: ${arg}`);
  },
  notEnoughArguments: function(index, expected, got) {
    return new Error(`Not enough arguments given at line ${index}: expected ${expected} argument, got ${got}`);
  },
  notMain: function(index) {
    return new Error(`Keyword should be in the main file at line ${index}`);
  }
};
