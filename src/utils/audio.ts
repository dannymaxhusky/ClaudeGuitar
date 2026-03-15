// Guitar audio synthesis using Web Audio API
// Plucked string sound via oscillator harmonics + noise attack

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!_ctx || _ctx.state === "closed") {
    _ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  if (_ctx.state === "suspended") _ctx.resume();
  return _ctx;
}

// Open string MIDI numbers: [E2, A2, D3, G3, B3, E4] (string 6 to string 1)
const OPEN_STRING_MIDI = [40, 45, 50, 55, 59, 64];

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

const NOTE_SEMITONE: Record<string, number> = {
  C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3,
  E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8,
  Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11,
  "C♭": 11, "D♭": 1, "E♭": 3, "F♭": 4, "G♭": 6, "A♭": 8, "B♭": 10,
  "C♯": 1, "D♯": 3, "E♯": 5, "F♯": 6, "G♯": 8, "A♯": 10, "B♯": 0,
};

export function noteNameToFreq(name: string, octave = 4): number {
  const m = name.trim().match(/^([A-G][#b♭♯]?)(\d)?$/);
  if (!m) return 440;
  const semitone = NOTE_SEMITONE[m[1]] ?? 0;
  const oct = m[2] !== undefined ? parseInt(m[2]) : octave;
  return midiToFreq((oct + 1) * 12 + semitone);
}

// Synthesize a single plucked guitar string
function pluck(freq: number, ctx: AudioContext, t: number, gain = 0.28) {
  const dur = 2.2;

  // Short noise burst for attack transient
  const nLen = Math.floor(ctx.sampleRate * 0.006);
  const nBuf = ctx.createBuffer(1, nLen, ctx.sampleRate);
  const nData = nBuf.getChannelData(0);
  for (let i = 0; i < nLen; i++) nData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (nLen * 0.25));
  const noise = ctx.createBufferSource();
  noise.buffer = nBuf;

  // Harmonic oscillators
  const harmonics = [1, 2, 3, 4];
  const hGains =   [0.55, 0.25, 0.12, 0.06];
  const hDurs =    [dur, dur * 0.65, dur * 0.4, dur * 0.25];

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = Math.min(freq * 7, 7000);
  filter.Q.value = 0.4;

  const master = ctx.createGain();
  master.gain.value = gain;
  filter.connect(master);
  master.connect(ctx.destination);

  harmonics.forEach((h, i) => {
    const osc = ctx.createOscillator();
    osc.type = i === 0 ? "triangle" : "sine";
    osc.frequency.value = freq * h;
    const g = ctx.createGain();
    g.gain.setValueAtTime(hGains[i], t);
    g.gain.exponentialRampToValueAtTime(0.001, t + hDurs[i]);
    osc.connect(g); g.connect(filter);
    osc.start(t); osc.stop(t + hDurs[i]);
  });

  const gn = ctx.createGain();
  gn.gain.setValueAtTime(0.18, t);
  gn.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  noise.connect(gn); gn.connect(filter);
  noise.start(t); noise.stop(t + 0.04);
}

// Parse chord name (e.g. "Am7", "Cmaj7", "G7") and play it
const CHORD_INTERVALS_MAP: Record<string, number[]> = {
  "":      [0, 4, 7],
  "m":     [0, 3, 7],
  "7":     [0, 4, 7, 10],
  "maj7":  [0, 4, 7, 11],
  "m7":    [0, 3, 7, 10],
  "dim":   [0, 3, 6],
  "dim7":  [0, 3, 6, 9],
  "aug":   [0, 4, 8],
  "sus4":  [0, 5, 7],
  "sus2":  [0, 2, 7],
  "m7b5":  [0, 3, 6, 10],
  "m7♭5": [0, 3, 6, 10],
  "add9":  [0, 4, 7, 14],
  "9":     [0, 4, 7, 10, 14],
};

export function playChordName(chordName: string, arpeggiate = true) {
  try {
    const ctx = getCtx();
    const m = chordName.match(/^([A-G][#b♭♯]?)(.*)/);
    if (!m) return;
    const rootSt = NOTE_SEMITONE[m[1]] ?? 0;
    const quality = m[2].trim();
    const intervals = CHORD_INTERVALS_MAP[quality] ?? CHORD_INTERVALS_MAP[""];
    const now = ctx.currentTime;
    const d = arpeggiate ? 0.07 : 0;
    intervals.forEach((iv, i) => {
      const st = (rootSt + iv) % 12;
      const oct = 3 + Math.floor((rootSt + iv) / 12);
      pluck(midiToFreq((oct + 1) * 12 + st), ctx, now + i * d, 0.26);
    });
  } catch (e) { console.warn("Audio:", e); }
}

// Play a single note (e.g. "C", "E♭", "F#")
export function playNote(noteName: string, octave = 4) {
  try {
    const ctx = getCtx();
    pluck(noteNameToFreq(noteName, octave), ctx, ctx.currentTime);
  } catch (e) { console.warn("Audio:", e); }
}

// Play chord from note name array (e.g. ["C", "E", "G"])
export function playChordNotes(notes: string[], arpeggiate = true) {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;
    const d = arpeggiate ? 0.07 : 0;
    let oct = 3, prev = -1;
    notes.forEach((note, i) => {
      const key = note.trim().replace(/♭/g, "b").replace(/♯/g, "#");
      const s = NOTE_SEMITONE[key] ?? 0;
      if (s <= prev && prev > -1) oct++;
      prev = s;
      pluck(noteNameToFreq(note, oct), ctx, now + i * d, 0.26);
    });
  } catch (e) { console.warn("Audio:", e); }
}

// Play chord from guitar fret array (null=muted, 0=open, N=fret)
// stringIdx 0 = low E (string 6), 5 = high e (string 1)
export function playGuitarFrets(frets: (number | null)[], baseFret = 0) {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;
    let pi = 0;
    frets.forEach((fret, si) => {
      if (fret === null) return;
      const midi = OPEN_STRING_MIDI[si] + fret + (baseFret > 1 ? baseFret - 1 : 0);
      pluck(midiToFreq(midi), ctx, now + pi * 0.07, 0.24);
      pi++;
    });
  } catch (e) { console.warn("Audio:", e); }
}

// Play two notes sequentially for interval demonstration
export function playInterval(note1: string, note2: string, oct1 = 4, oct2 = 4) {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;
    pluck(noteNameToFreq(note1, oct1), ctx, now, 0.32);
    pluck(noteNameToFreq(note2, oct2), ctx, now + 0.55, 0.32);
  } catch (e) { console.warn("Audio:", e); }
}

// Play a note by string index + fret (for fretboard clicks)
// displayStringIdx 0=high e, 5=low E (matches scales page layout)
export function playFretboardNote(displayStringIdx: number, fret: number) {
  try {
    const ctx = getCtx();
    // displayStringIdx 0 = high e = OPEN_STRING_MIDI index 5
    const midiStringIdx = 5 - displayStringIdx;
    const midi = OPEN_STRING_MIDI[midiStringIdx] + fret;
    pluck(midiToFreq(midi), ctx, ctx.currentTime, 0.3);
  } catch (e) { console.warn("Audio:", e); }
}
