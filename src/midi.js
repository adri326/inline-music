const MidiWriter = require("midi-writer-js");

module.exports = function midi(obj) {
  let tracks = Object.entries(obj.scores).map(([name, value]) => convertScore(value, name, obj));
  return new MidiWriter.Writer(tracks);
}
function convertScore(obj, name, glob) {
  let track = new MidiWriter.Track();
  track.addTrackName(name);
  track.setTempo(glob.tempo);
  track.setTimeSignature(glob.measure[0], glob.measure[1]);
  if (obj.instrument) track.addInstrumentName(obj.instrument);

  let pos = 0; // position of the last note
  let mpos = 0; // position of the current measure
  for (let measure of obj.measures) {
    for (let note of measure.notes) {
      let wait = note.position.toBeats(glob.measure) * toTicks(glob.measure) + mpos - pos;

      let event = new MidiWriter.NoteEvent({
        duration: "T" + note.length.toBeats(glob.measure) * toTicks(glob.measure),
        pitch: note.pitch.map((p) => p.toMidi()),
        wait: "T" + wait
      });

      track.addEvent(event);

      pos = (note.position.toBeats(glob.measure) + note.length.toBeats(glob.measure)) * toTicks(glob.measure) + mpos;
    }
    mpos += toPosSpan(glob.measure);
  }
  return track;
}

function toTicks(measure) {
  return 512 / (measure[1]);
}

function toPosSpan(measure) {
  return toTicks(measure) * measure[0];
}

function toPos(measure, note) {
  return toTicks(measure) * note.position.toBeats(measure);
}
