// 📁 public/wordManager.js
(function (global) {
  const STORAGE_KEY = 'wordDictionary';
  let dictionary = [];

  function loadFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        dictionary = JSON.parse(data);
        console.log(`🗃️ Loaded ${dictionary.length} words from localStorage`);
      } catch (e) {
        dictionary = [];
        console.warn("⚠️ Failed to parse localStorage dictionary.");
      }
    }
  }

  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dictionary));
  }

  function loadFromFile(path = 'pages/wordsGames/data/dictionary.txt') {
    fetch(path)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(text => {
        const words = text
          .split('\n')
          .map(w => w.trim().toLowerCase())
          .filter(w => /^[a-z]{3,}$/.test(w));

        WordManager.loadList(words);
        saveToStorage();
        console.log(`📗 Loaded ${words.length} words from ${path}`);
      })
      .catch(err => {
        console.error("❌ Failed to load dictionary.txt:", err);
        loadFromStorage();
      });
  }

  const WordManager = {
    init() {
      loadFromFile(); // Automatically tries to load dictionary.txt
    },

    loadFromFile, // expose if you want to re-load manually

    loadList(wordArray) {
      dictionary = Array.from(new Set(wordArray.map(w => w.toLowerCase())));
    },

    isValid(word) {
      return dictionary.includes(word.toLowerCase());
    },

    addWord(word) {
      word = word.toLowerCase();
      if (!dictionary.includes(word)) {
        dictionary.push(word);
        saveToStorage();
        console.log(`➕ Word added: ${word}`);
      }
    },

    getAllWords() {
      return [...dictionary];
    }
  };

  global.WordManager = WordManager;
})(window);
