// wordManager.js
(function (global) {
  const STORAGE_KEY = 'wordDictionary';
  let dictionary = [];

  function load() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        dictionary = JSON.parse(data);
      } catch {
        dictionary = [];
      }
    } else {
      dictionary = ['apple', 'banana', 'quiz']; // optional default
      save();
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dictionary));
  }

  const WordManager = {
    load,
    isValidWord: word => dictionary.includes(word.toLowerCase()),
    addWord: word => {
      word = word.toLowerCase();
      if (!dictionary.includes(word)) {
        dictionary.push(word);
        save();
      }
    },
    getAllWords: () => [...dictionary],
  };

  // Attach to global (temporarily, GameManager will pick it up)
  global.__WordManagerModule = WordManager;
})(window);
