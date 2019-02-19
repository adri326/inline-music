# inline-music

Write your music, in a text editor!

## Concept

The core idea of this project was to create a language to write music in a text editors, using a human-friendly language.
For this, I decided that music would be written from top to bottom, instead of writing it left to right.
This makes it simple to add notes/measures to the track.

## Installation & Usage

*This will change in the future to allow an actual installation of the software*

```sh
git clone https://github.com/adri326/inline-music
cd inline-music
npm i
node ./index.js --midi test/score-1 test/score-1.midi
```

## Syntax

Every statement, note, etc. is done on its own line and is recognized by a specific keyword.
Pieces of the statements are separated by spaces, their number is not important, as long as there is at least one.

## Prelude

The prelude includes the measure declaration and the tempo, and has to be set.
Measure declaration is done using the `measure` keyword:

```
measure 4/4
```

Will declare a `4/4` measure.

***TODO*** *: Note grouping*

Tempo declaration is done similarly, using the `tempo` keyword.

```
tempo 80
```

Will declare a 80 bpm tempo.

Once you have these two things set up, you can start adding notes.

## Notes

The note's keyword is `at`, and its syntax is the following:

**at** position **for** length **-** notes...

`position` and `length` have their own syntax:

| Time syntax | Correspondance             |
| :---------- | :-------------             |
| `1`         | 1 beat                     |
| `.1`        | 1 half of a beat (if the beat is separated in two - this feature is not implemented yet) |
| `..1`       | 1 quarter of a beat        |
| `3.1.1`     | 3 beats with 3/4 of a beat |

`position` corresponds to the position of the note relative to the beginning of the measure.
Notes are written in the [scientific pitch notation](https://en.wikipedia.org/wiki/Scientific_pitch_notation) and separated with spaces.

As an example, this will play an A4 minor chord for 1 beat:

```
at 0 for 1 - A4 C5 E5
```

## Measures

Every measure is separated using the `next measure` statement. The first measure does not have to be separated from the prelude.
Each measure contains the amount of beats as specified in the prelude, and their notes have to start in them (they may end outside).

## Files

Each file represent a track and has the `.ipart` extension. A directory represent a score.
A score requires a `main.ipart` file, in which the prelude is set.

You may specify as the input argument to the parser a `.ipart` file, which will be treated as a score of itself.

## Command

Usage can be seen using the `--help` argument.
