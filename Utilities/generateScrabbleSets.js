const fs = require('fs');

const WORD_LIST_FILE = '../Data/words.txt'; // <- Use the cleaned core list
const OUTPUT_FILE = 'balanced_tile_pairs.txt';
const TILE_COUNT = 7;
const PAIRS_NEEDED = 10; // ← You can raise to 500+ later
const MIN_WORDS = 3;
const MAX_WORDS = 10;

const SCRABBLE_POINTS = {
  a: 1, b: 3, c: 3, d: 2, e: 1,
  f: 4, g: 2, h: 4, i: 1, j: 8,
  k: 5, l: 1, m: 3, n: 1, o: 1,
  p: 3, q: 10, r: 1, s: 1, t: 1,
  u: 1, v: 4, w: 4, x: 8, y: 4, z: 10,
};

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

const tileBag = (
  'eeeeeeeeeeee' + 'aaaaaaaaa' + 'iiiiiiii' + 'oooooooo' +
  'nnnnn' + 'rrrrr' + 'ttttt' + 'llll' + 'ssss' + 'uuuu' +
  'dd' + 'ggg' + 'bb' + 'cc' + 'mm' + 'pp' + 'ff' + 'hh' +
  'vv' + 'ww' + 'yy' + 'k' + 'j' + 'x' + 'q' + 'z'
).split('');

const words = fs.readFileSync(WORD_LIST_FILE, 'utf-8')
  .split('\n')
  .map(w => w.trim().toLowerCase())
  .filter(w => w.length >= 3 && w.length <= 6);

function getRandomTiles() {
  const tiles = [];
  for (let i = 0; i < TILE_COUNT; i++) {
    tiles.push(tileBag[Math.floor(Math.random() * tileBag.length)]);
  }
  return tiles;
}

function canForm(word, tiles) {
  const copy = tiles.slice();
  for (let ch of word) {
    let idx = copy.indexOf(ch);
    if (idx === -1) return false;
    copy.splice(idx, 1);
  }
  return true;
}

function scoreWord(word) {
  return word.split('').reduce((acc, ch) => acc + SCRABBLE_POINTS[ch] || 0, 0);
}

function evaluateSet(tiles) {
  const validWords = words.filter(w => canForm(w, tiles));
  const scrabbleScore = validWords.reduce((sum, w) => sum + scoreWord(w), 0);
  const vowels = tiles.filter(t => VOWELS.has(t)).length;
  const consonants = TILE_COUNT - vowels;

  return {
    tiles,
    words: validWords.slice(0, MAX_WORDS),
    score: scrabbleScore,
    vowels,
    consonants,
  };
}

// Simple distance function to pair balanced sets
function isCloseEnough(setA, setB) {
  return (
    Math.abs(setA.score - setB.score) <= 5 &&
    Math.abs(setA.vowels - setB.vowels) <= 1 &&
    Math.abs(setA.words.length - setB.words.length) <= 1
  );
}

function generateBalancedPairs() {
  const pool = [];
  const pairs = [];

  while (pairs.length < PAIRS_NEEDED) {
    const set = evaluateSet(getRandomTiles());
    if (set.words.length < MIN_WORDS) continue;

    let matched = false;
    for (let i = 0; i < pool.length; i++) {
      if (isCloseEnough(pool[i], set)) {
        pairs.push([pool[i], set]);
        pool.splice(i, 1);
        matched = true;
        break;
      }
    }

    if (!matched) {
      pool.push(set);
    }

    if (pairs.length % 5 === 0) {
      console.log(`Generated ${pairs.length} balanced pairs...`);
    }
  }

  return pairs;
}

function savePairs(pairs) {
  const output = pairs.map(([p1, p2], i) => {
    return `\nPair ${i + 1}:\n` +
      `  P1: ${p1.tiles.join('')} | Words: ${p1.words.join(', ')} | Score: ${p1.score}\n` +
      `  P2: ${p2.tiles.join('')} | Words: ${p2.words.join(', ')} | Score: ${p2.score}`;
  }).join('\n');

  fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');
  console.log(`✅ Saved ${pairs.length} balanced pairs to ${OUTPUT_FILE}`);
}

const pairs = generateBalancedPairs();
savePairs(pairs);
