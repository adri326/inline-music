const tonal = require("tonal");
const Note = require("../src/note");

module.exports = function chord([base, ...attribs], index) {
  let intervals = tonal.Chord.intervals(attribs.map(parseAttrib).join(""));
  let notes = [];
  for (let interval of intervals) {
    notes.push(tonal.Distance.transpose(base, interval));
  }
  return notes.join(" ");
}

const aliases = {
  "minor": "m",
  "major": "M",
  "Major": "Major",
  "7major": "Maj7",
  "dim5": "b5"
};

function parseAttrib(attrib) {
  if (aliases[attrib]) return aliases[attrib];
  else return attrib;
}
