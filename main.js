
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const noteFreqMap = {
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
  'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
  'A#4': 466.16, 'B4': 493.88,

  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25,
  'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00,
  'A#5': 932.33, 'B5': 987.77,

  'C6': 1046.50, 'C#6': 1108.73, 'D6': 1174.66, 'D#6': 1244.51, 'E6': 1318.51,
  'F6': 1396.91, 'F#6': 1479.98, 'G6': 1567.98, 'G#6': 1661.22, 'A6': 1760.00,
  'A#6': 1864.66, 'B6': 1975.53
};

function playFreq(freq) {
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
  osc.start();
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
  osc.stop(audioCtx.currentTime + 0.8);
}

function playNote(note) {
  const freq = noteFreqMap[note];
  if (freq) playFreq(freq);
}

const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function buildChord(root, type) {
  let rootIdx = chromaticScale.indexOf(root);
  if (rootIdx === -1) return [];

  function noteAt(idx, baseOctave) {
    const noteName = chromaticScale[idx % 12];
    const octave = baseOctave + Math.floor(idx / 12);
    return noteName + octave;
  }

  let octave = 4;
  let notes = [];

  switch (type) {
    case 'major':
      notes = [noteAt(rootIdx, octave), noteAt(rootIdx + 4, octave), noteAt(rootIdx + 7, octave)];
      break;
    case 'minor':
      notes = [noteAt(rootIdx, octave), noteAt(rootIdx + 3, octave), noteAt(rootIdx + 7, octave)];
      break;
    case '7th':
      notes = [noteAt(rootIdx, octave), noteAt(rootIdx + 4, octave), noteAt(rootIdx + 7, octave), noteAt(rootIdx + 10, octave)];
      break;
    case 'maj7':
      notes = [noteAt(rootIdx, octave), noteAt(rootIdx + 4, octave), noteAt(rootIdx + 7, octave), noteAt(rootIdx + 11, octave)];
      break;
    case 'dim':
      notes = [noteAt(rootIdx, octave), noteAt(rootIdx + 3, octave), noteAt(rootIdx + 6, octave)];
      break;
    case 'aug':
      notes = [noteAt(rootIdx, octave), noteAt(rootIdx + 4, octave), noteAt(rootIdx + 8, octave)];
      break;
    case 'sus2':
      notes = [noteAt(rootIdx, octave), noteAt(rootIdx + 2, octave), noteAt(rootIdx + 7, octave)];
      break;
    case 'sus4':
      notes = [noteAt(rootIdx, octave), noteAt(rootIdx + 5, octave), noteAt(rootIdx + 7, octave)];
      break;
    default:
      notes = [noteAt(rootIdx, octave)];
  }

  return notes;
}

function playChord(notes) {
  notes.forEach(note => playNote(note));
}

// คีย์เปียโนหลัก
const piano = document.getElementById('piano');
const pianoKeys = {};
piano.querySelectorAll('.key').forEach(key => {
  pianoKeys[key.dataset.note] = key;
  key.addEventListener('click', () => {
    playNote(key.dataset.note);
    highlightNoteOnPiano(key.dataset.note);
  });
});

function highlightNoteOnPiano(note) {
  Object.values(pianoKeys).forEach(k => {
    k.classList.remove('highlight-white', 'highlight-black');
  });
  const key = pianoKeys[note];
  if (!key) return;
  if (key.classList.contains('white')) {
    key.classList.add('highlight-white');
  } else {
    key.classList.add('highlight-black');
  }
}

function createMiniPiano(notes) {
  const piano = document.createElement('div');
  piano.className = 'mini-piano';

  const whiteOrder = ['C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6'];
  whiteOrder.forEach(note => {
    const k = document.createElement('div');
    k.className = 'key white';
    k.textContent = note[0];
    k.dataset.note = note;
    piano.appendChild(k);
  });

  const blackNotes = [
    { note: 'C#5', cls: 'cSharp' },
    { note: 'D#5', cls: 'dSharp' },
    { note: 'F#5', cls: 'fSharp' },
    { note: 'G#5', cls: 'gSharp' },
    { note: 'A#5', cls: 'aSharp' },
    { note: 'C#6', cls: 'cSharp6' },
    { note: 'D#6', cls: 'dSharp6' }
  ];
  blackNotes.forEach(({ note, cls }) => {
    const k = document.createElement('div');
    k.className = 'key black ' + cls;
    k.textContent = note[0] + '#';
    k.dataset.note = note;
    piano.appendChild(k);
  });

  piano.querySelectorAll('.key').forEach(key => {
    if (notes.includes(key.dataset.note)) {
      key.classList.add('pressed');
    }
  });

  return piano;
}

function highlightChordOnPiano(notes) {
  Object.values(pianoKeys).forEach(k => {
    k.classList.remove('highlight-white', 'highlight-black');
  });

  notes.forEach(note => {
    const noteOctave4 = note.slice(0, -1) + '4';
    if (pianoKeys[noteOctave4]) {
      const key = pianoKeys[noteOctave4];
      if (key.classList.contains('white')) {
        key.classList.add('highlight-white');
      } else {
        key.classList.add('highlight-black');
      }
    } else if (pianoKeys[note]) {
      const key = pianoKeys[note];
      if (key.classList.contains('white')) {
        key.classList.add('highlight-white');
      } else {
        key.classList.add('highlight-black');
      }
    }
  });
}

const chords = [];
['C', 'D', 'E', 'F', 'G', 'A', 'B'].forEach(root => {
  ['major', 'minor', '7th', 'maj7', 'dim', 'aug', 'sus2', 'sus4'].forEach(type => {
    chords.push({ root, type });
  });
});

const chordListDiv = document.getElementById('chord-list');
let selectedChordIndex = -1;

function renderChordList() {
  chordListDiv.innerHTML = '';
  chords.forEach((chord, idx) => {
    const chordDiv = document.createElement('div');
    chordDiv.className = 'chord';
    chordDiv.textContent = `${chord.root} ${chord.type}`;
    chordDiv.dataset.index = idx;

    const chordNotes = buildChord(chord.root, chord.type);
    const miniPiano = createMiniPiano(chordNotes);
    chordDiv.appendChild(miniPiano);

    chordDiv.addEventListener('click', () => {
      selectChord(idx);
    });

    chordListDiv.appendChild(chordDiv);
  });
}

function selectChord(idx) {
  if (selectedChordIndex === idx) return;

  selectedChordIndex = idx;

  chordListDiv.querySelectorAll('.chord').forEach((el, i) => {
    el.classList.toggle('selected', i === idx);
  });

  const chord = chords[idx];
  const notes = buildChord(chord.root, chord.type);
  playChord(notes);
  highlightChordOnPiano(notes);
}



