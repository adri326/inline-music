class Note {
  constructor(raw) {
    let parsed = /^([A-G])([b#]?)(\d+)$/.exec(raw);
    if (!parsed) throw new Error("Invalid note: " + raw);
    this.name = parsed[1];
    switch (parsed[2]) {
      case "b":
        this.mod = -1;
        break;
      case "#":
        this.mod = 1;
        break;
      default:
        this.mod = 0;
    }
    this.height = Number(parsed[3]);
  }

  toMidi() {
    let mod = "";
    switch (this.mod) {
      case -1:
        mod = "b";
        break;
      case 1:
        mod = "#";
        break;
    }
    return this.name + mod + this.height;
  }

  toString() {
    return this.toMidi();
  }

  [Symbol.toPrimitive](hint) {
    return this.toString();
  }

  toJSON() {
    return this.toString();
  }
}

module.exports = Note;
