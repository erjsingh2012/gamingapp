// Global Game Manager - persists across pages and includes WordManager
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
      state = { ...state, ...JSON.parse(saved) };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  const manager = {
    // Initialize GameManager and WordManager
    init() {
      console.log('GameManager initialized');
      loadState();

      // Integrate WordManager
      WordManager = window.__WordManagerModule;
      if (WordManager) {
        WordManager.load();
        this.WordManager = WordManager;
      } else {
        console.warn('⚠️ WordManager not loaded when GameManager initialized');
        this.WordManager = {
          load: () => {},
          isValidWord: () => false,
          addWord: () => {},
          getAllWords: () => [],
        };
      }

      delete window.__WordManagerModule;
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
