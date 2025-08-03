// 📁 public/gameManager.js

window.GameManager = (function () {
  const STORAGE_KEY = 'scrabbleGameState';

  let state = {
    currentGame: null,
    playerStats: {
      totalScore: 0,
      gamesPlayed: 0,
      bestWord: '',
      bestScore: 0,
    },
    gameHistory: [],
    settings: {
      soundEnabled: true,
      difficulty: 'normal',
    },
  };

  let WordManager = null;

  function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        state = { ...state, ...JSON.parse(saved) };
      } catch (e) {
        console.warn("⚠️ Failed to parse saved game state.");
      }
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  const manager = {
    // Initialize GameManager and link WordManager
    init() {
      console.log('🧠 GameManager initialized');
      loadState();

      WordManager = window.WordManager;
      if (WordManager) {
        WordManager.init(); // Load dictionary
        this.WordManager = WordManager;
      } else {
        console.warn('⚠️ WordManager not found. Falling back to dummy.');
        this.WordManager = {
          init: () => {},
          isValid: () => false,
          addWord: () => {},
          getAllWords: () => [],
        };
      }

      return this;
    },

    // Game state management
    startGame(gameType) {
      state.currentGame = {
        type: gameType,
        startTime: Date.now(),
        score: 0,
        moves: [],
        board: null,
        rack: null,
      };
      saveState();
      return state.currentGame;
    },

    saveGameState(gameData) {
      if (state.currentGame) {
        state.currentGame = { ...state.currentGame, ...gameData };
        saveState();
      }
    },

    getGameState() {
      return state.currentGame;
    },

    endGame(finalScore) {
      if (state.currentGame) {
        state.playerStats.gamesPlayed++;
        state.playerStats.totalScore += finalScore;

        if (finalScore > state.playerStats.bestScore) {
          state.playerStats.bestScore = finalScore;
        }

        state.gameHistory.push({
          ...state.currentGame,
          endTime: Date.now(),
          finalScore,
        });

        state.currentGame = null;
        saveState();
      }
    },

    // Player stats
    getStats() {
      return state.playerStats;
    },

    updateStats(updates) {
      state.playerStats = { ...state.playerStats, ...updates };
      saveState();
    },

    // Settings
    getSettings() {
      return state.settings;
    },

    updateSettings(updates) {
      state.settings = { ...state.settings, ...updates };
      saveState();
    },

    // Word dictionary helpers
    isValidWord(word) {
      return this.WordManager.isValid(word);
    },

    addWord(word) {
      this.WordManager.addWord(word);
    },

    getAllWords() {
      return this.WordManager.getAllWords();
    },

    loadDictionary(path) {
      if (this.WordManager.loadFromFile) {
        this.WordManager.loadFromFile(path);
      }
    },

    // Utility
    clearAll() {
      localStorage.removeItem(STORAGE_KEY);
      state = {
        currentGame: null,
        playerStats: {
          totalScore: 0,
          gamesPlayed: 0,
          bestWord: '',
          bestScore: 0,
        },
        gameHistory: [],
        settings: {
          soundEnabled: true,
          difficulty: 'normal',
        },
      };
    },
  };

  return manager.init();
})();
