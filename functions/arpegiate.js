const Time = require("../src/time");

const kinds = {
  pyramid: (n, length) => {
    n = n % (length * 2 - 2);
    if (n < length) return n;
    else return (2 * length - 2 - n);
  }
}

module.exports = function arpegiate([at, totalDuration, noteDuration, kind, ...notes], index, glob) {
  let res = "~";
  let times = Math.floor(new Time(totalDuration).toBeats(glob) / new Time(noteDuration).toBeats(glob));

  for (let x = 0; x < times; x++) {
    let step = kinds[kind](x, notes.length);
    let pos = new Time(noteDuration).mult(x).add(at);
    res += `\nat ${pos.toString()} for ${noteDuration} - ${notes[step]}`;
  }
  return res;
}
