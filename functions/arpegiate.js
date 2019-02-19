const Time = require("../src/time");

const MODES = {
  pyramid: (n, notes) => {
    let length = notes.length;
    n = n % (length * 2 - 2);
    if (n < length) return notes[n];
    else return notes[2 * length - 2 - n];
  },
  ascending: (n, notes) => {
    return notes[n % notes.length];
  },
  descending: (n, notes) => {
    return notes[notes.length - (n % notes.length) - 1];
  },
  chords: (n, notes) => {
    return notes.join(" ");
  },
  rising_chords: (n, notes) => {
    return notes.slice(0, Math.min(n + 1, notes.length)).join(" ");
  },
  constant: (n, notes) => notes.join(" "),
  _custom: (steps) => ((n, notes) => {
    return notes[steps[n % steps.length] - 1];
  })
}

module.exports = function arpegiate([at, _totalDuration, _noteDuration, _mode, ...notes], index, glob) {
  let mode = MODES[_mode];
  if (!mode) {
    if (/^\d+(-\d+)+$/.exec(_mode)) {
      let steps = _mode.split("-").map(Number);
      mode = MODES._custom(steps);
      for (let step of steps) {
        if (step > notes.length) throw new Error(`[arpegiate(...)]: Invalid mode: ${mode}; step ${step} is greater than the amount of notes (${notes.length})`);
      }
    }
    else {
      throw new Error(`[arpegiate(...)]: Unknown mode: ${mode} at line ${index}`);
    }
  }
  let res = "~";
  let noteDuration;
  let subNoteDuration;
  if (_noteDuration.split("/").length == 2) {
    noteDuration = new Time(_noteDuration.split("/")[0]);
    subNoteDuration = new Time(_noteDuration.split("/")[1]);
  } else {
    noteDuration = new Time(_noteDuration);
    subNoteDuration = noteDuration;
  }
  let totalDuration = new Time(_totalDuration);
  if (noteDuration.isNull()) throw new Error(`[arpegiate(...)]: Note duration is null at line ${index}: ${_noteDuration}`);
  if (totalDuration.isNull()) throw new Error(`[arpegiate(...)]: Total duration is null at line ${index}: ${_totalDuration}`);
  let times = Math.floor(totalDuration.toBeats(glob) / noteDuration.toBeats(glob));

  for (let x = 0; x < times; x++) {
    let step = mode(x, notes);
    if (typeof step === "undefined") throw new Error(`[arpegiate(...)]: Note ${x} could not be retrieved`);
    let pos = noteDuration.mult(x).add(at);
    res += `\nat ${pos.toString()} for ${subNoteDuration} - ${step}`;
  }
  return res;
}
