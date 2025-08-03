const fs = require('fs');
const path = require('path');

const WORD_LIST_FILE = '../Data/words.txt';
const OUTPUT_FILE = 'scrabble_sets_with_words.txt';
const REQUIRED_SETS = 1000;
const TILE_COUNT = 7;
const MIN_WORDS = 3;
const MAX_WORDS = 5;

// Load valid words from dictionary
const wordList = fs.readFileSync(WORD_LIST_FILE, 'utf-8')
  .split('\n')
  .map(w => w.trim().toLowerCase())
  .filter(w => w.length >= 3 && w.length <= 6);

const tileBag = (
  'eeeeeeeeeeee' + 'aaaaaaaaa' + 'iiiiiiii' + 'oooooooo' +
  'nnnnn' + 'rrrrr' + 'ttttt' + 'llll' + 'ssss' + 'uuuu' +
  'dd' + 'ggg' + 'bb' + 'cc' + 'mm' + 'pp' + 'ff' + 'hh' +
  'vv' + 'ww' + 'yy' + 'k' + 'j' + 'x' + 'q' + 'z'
).split('');

function getRandomTiles(count = TILE_COUNT) {
  let result = [];
  for (let i = 0; i < count; i++) {
    result.push(tileBag[Math.floor(Math.random() * tileBag.length)]);
  }
  return result;
}

function canFormWord(word, tiles) {
  const tempTiles = tiles.slice();
  for (let letter of word) {
    const index = tempTiles.indexOf(letter);
    if (index === -1) return false;
    tempTiles.splice(index, 1);
  }
  return true;
}

function findValidWords(tileSet) {
  return wordList.filter(word => canFormWord(word, tileSet));
}

function generateSets() {
  const sets = new Set();
  const results = [];

  while (results.length < REQUIRED_SETS) {
    const tiles = getRandomTiles();
    const sortedKey = tiles.slice().sort().join('');

    if (sets.has(sortedKey)) continue;

    const words = findValidWords(tiles);

    if (words.length >= MIN_WORDS && words.length <= MAX_WORDS) {
      sets.add(sortedKey);
      results.push({ tiles: sortedKey, words });
      console.log(`[${results.length}/${REQUIRED_SETS}] ${sortedKey} → ${words.length} words → ${words.join(', ')}`);
    }
  }

  const fileContent = results.map(entry => {
    return `${entry.tiles} : ${entry.words.join(', ')}`;
  }).join('\n');

  fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf-8');
  console.log(`✅ Done. Saved ${results.length} sets with words to '${OUTPUT_FILE}'`);
}

generateSets();