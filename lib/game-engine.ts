// Game engine for LetterBlast
// Handles core game mechanics, letter generation, scoring, etc.

export type GameDifficulty = 'easy' | 'medium' | 'hard';

export type Letter = {
  id: string;
  character: string;
  position: [number, number, number];
  color: string;
  velocity: [number, number, number];
  active: boolean;
  // Add a missed property to track missed shots for feedback
  missed?: boolean;
};

export type GameState = {
  difficulty: GameDifficulty;
  score: number;
  lives: number;
  currentWord: string;
  targetWord: string;
  letters: Letter[];
  timeRemaining: number;
  isGameOver: boolean;
  // Add feedback properties
  lastShotResult?: 'hit' | 'miss' | null;
  comboCount: number;
  lastShotLetterId?: string;
  lastShotTimestamp?: number;
};

// Word lists for different difficulty levels
const wordLists = {
  easy: ['STAR', 'MOON', 'SUN', 'MARS', 'GLOW', 'BEAM', 'RISE', 'RAYS'],
  medium: ['COMET', 'ORBIT', 'SOLAR', 'LUNAR', 'SPACE', 'PLANET', 'COSMIC'],
  hard: ['GALAXY', 'NEBULA', 'QUASAR', 'PULSAR', 'METEOR', 'ECLIPSE', 'STELLAR'],
};

// Generate a random color in hex format with space theme
const getRandomColor = (): string => {
  const colors = [
    '#5E97F6', // Blue
    '#C6A4F8', // Purple
    '#FF9E80', // Orange
    '#4DB6AC', // Teal
    '#FF8A80', // Pink/Red
    '#FFD54F', // Yellow
    '#81C784', // Green
    '#9FA8DA'  // Lavender
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Generate a position for a shooting star letter
const getRandomPosition = (spread: number = 15): [number, number, number] => {
  // Position stars further away and to the sides/top so they can streak across
  const side = Math.random() > 0.5 ? 1 : -1; // Left or right side
  const vertical = Math.random() > 0.5;      // From top or from sides
  
  if (vertical) {
    // Come from top
    return [
      (Math.random() - 0.5) * spread,        // x: Horizontal position along top
      spread / 2 + Math.random() * 5,        // y: Above the view
      -15 - Math.random() * 10              // z: Distant depth
    ];
  } else {
    // Come from sides
    return [
      side * (spread / 2 + Math.random() * 5),  // x: Far to the left or right
      (Math.random() - 0.5) * spread,          // y: Vertical position along side
      -15 - Math.random() * 10                 // z: Distant depth
    ];
  }
};

// Generate velocity with a diagonal trajectory like shooting stars
const getRandomVelocity = (speed: number = 0.01): [number, number, number] => {
  // Determine direction based on starting position
  // If position is top, move down+left or down+right
  // If position is sides, move diagonally toward center
  
  const xDirection = Math.random() > 0.5 ? 1 : -1;
  const speedMultiplier = 
    speed === 0.005 ? 1 :    // easy
    speed === 0.01 ? 1.5 :   // medium
    2;                      // hard
  
  return [
    xDirection * (0.5 + Math.random() * 0.5) * speed * 8 * speedMultiplier,  // x: stronger horizontal movement
    -(0.3 + Math.random() * 0.5) * speed * 8 * speedMultiplier,              // y: downward movement
    0.1 * speed * speedMultiplier                                           // z: slight forward movement
  ];
};

// Initialize a new game state
export const initializeGame = (difficulty: GameDifficulty = 'easy'): GameState => {
  // Select a random target word based on difficulty
  const wordList = wordLists[difficulty];
  const targetWord = wordList[Math.floor(Math.random() * wordList.length)];
  
  // Create letters for the target word and some distractors
  const letters: Letter[] = generateLettersForWord(targetWord, difficulty);
  
  // Initial game state
  return {
    difficulty,
    score: 0,
    lives: difficulty === 'easy' ? 5 : difficulty === 'medium' ? 4 : 3,
    currentWord: '',
    targetWord,
    letters,
    timeRemaining: difficulty === 'easy' ? 60 : difficulty === 'medium' ? 45 : 30,
    isGameOver: false,
    comboCount: 0,
    lastShotResult: null,
  };
};

// Generate letters for a word and add some distractor letters
const generateLettersForWord = (word: string, difficulty: GameDifficulty): Letter[] => {
  const letters: Letter[] = [];
  const uniqueChars = new Set(word.split(''));
  
  // Add letters from the target word
  word.split('').forEach((char, index) => {
    letters.push({
      id: `letter-${char}-${index}`,
      character: char,
      position: getRandomPosition(),
      color: getRandomColor(),
      velocity: getRandomVelocity(
        difficulty === 'easy' ? 0.005 : difficulty === 'medium' ? 0.01 : 0.015
      ),
      active: false,
      missed: false,
    });
  });
  
  // Add some distractor letters
  const numDistractors = 
    difficulty === 'easy' ? 3 : 
    difficulty === 'medium' ? 5 :
    7;
  
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  for (let i = 0; i < numDistractors; i++) {
    // Pick a random letter not in our word
    let distractor;
    do {
      distractor = alphabet[Math.floor(Math.random() * alphabet.length)];
    } while (uniqueChars.has(distractor));
    
    letters.push({
      id: `distractor-${distractor}-${i}`,
      character: distractor,
      position: getRandomPosition(),
      color: getRandomColor(),
      velocity: getRandomVelocity(
        difficulty === 'easy' ? 0.005 : difficulty === 'medium' ? 0.01 : 0.015
      ),
      active: false,
      missed: false,
    });
  }
  
  return letters;
};

// Update game state (for each animation frame)
export const updateGameState = (state: GameState, deltaTime: number): GameState => {
  if (state.isGameOver) return state;
  
  // Update time remaining
  const timeRemaining = Math.max(0, state.timeRemaining - deltaTime);
  
  // Check if time's up
  if (timeRemaining <= 0) {
    return {
      ...state,
      timeRemaining: 0,
      isGameOver: true,
    };
  }
  
  // Update letter positions based on their velocities
  const updatedLetters = state.letters.map(letter => {
    if (letter.active) return letter;
    
    const [x, y, z] = letter.position;
    const [vx, vy, vz] = letter.velocity;
    
    // Update position
    const newPosition: [number, number, number] = [
      x + vx * deltaTime * 60, // Scale by 60 to normalize for approx 60fps
      y + vy * deltaTime * 60,
      z + vz * deltaTime * 60,
    ];
    
    // Check if letter has moved out of bounds
    const outOfBounds = 
      Math.abs(newPosition[0]) > 20 || // Too far left/right
      newPosition[1] < -15 ||          // Too far down
      newPosition[2] > 5;              // Too close to camera
    
    // If out of bounds, reset position (create a new shooting star from outside)
    if (outOfBounds) {
      const newPos = getRandomPosition();
      const newVel = getRandomVelocity(
        state.difficulty === 'easy' ? 0.005 : 
        state.difficulty === 'medium' ? 0.01 : 
        0.015
      );
      
      return {
        ...letter,
        position: newPos,
        velocity: newVel,
        color: getRandomColor(), // New color for variety
        missed: false, // Reset missed state when recycling
      };
    }
    
    return {
      ...letter,
      position: newPosition as [number, number, number],
    };
  });
  
  return {
    ...state,
    letters: updatedLetters,
    timeRemaining,
    // Reset shot result after a short time to avoid persisting feedback
    lastShotResult: state.lastShotResult && Date.now() - (state.lastShotTimestamp || 0) > 500 ? null : state.lastShotResult,
  };
};

// Handle player shooting a letter
export const handleLetterShot = (state: GameState, letterId: string): GameState => {
  const letter = state.letters.find(l => l.id === letterId);
  if (!letter) return state;
  
  const targetWord = state.targetWord;
  const currentWord = state.currentWord;
  
  // Debug log to help track lives changes
  console.log('Before shot - Lives:', state.lives);
  
  // Check if this is the next letter in the target word
  const nextIndex = currentWord.length;
  if (nextIndex < targetWord.length && letter.character === targetWord[nextIndex]) {
    // Correct letter
    const newCurrentWord = currentWord + letter.character;
    
    // Update the shot letter's state (mark as active/hit)
    const updatedLetters = state.letters.map(l => 
      l.id === letterId ? { ...l, active: true } : l
    );
    
    // Increment combo
    const newComboCount = state.comboCount + 1;
    
    // Check if word is complete
    if (newCurrentWord === targetWord) {
      // Calculate score based on difficulty and remaining time
      const difficultyMultiplier = 
        state.difficulty === 'easy' ? 1 :
        state.difficulty === 'medium' ? 2 :
        3;
      
      const timeBonus = Math.floor(state.timeRemaining * 0.1);
      const comboBonus = state.comboCount * 5; // Add combo bonus
      const wordScore = 10 * targetWord.length * difficultyMultiplier + timeBonus + comboBonus;
      
      // Get a new target word
      const newState = initializeGame(state.difficulty);
      
      // Ensure we keep the current lives count when moving to a new word
      newState.lives = state.lives;
      console.log('Word complete - Lives maintained:', newState.lives);
      
      return {
        ...newState,
        score: state.score + wordScore,
        lastShotResult: 'hit',
        lastShotLetterId: letterId,
        lastShotTimestamp: Date.now(),
      };
    }
    
    return {
      ...state,
      currentWord: newCurrentWord,
      letters: updatedLetters,
      lastShotResult: 'hit',
      lastShotLetterId: letterId,
      comboCount: newComboCount,
      lastShotTimestamp: Date.now(),
    };
  } else {
    // Wrong letter - mark it as missed for visual feedback
    const updatedLetters = state.letters.map(l => 
      l.id === letterId ? { ...l, missed: true } : l
    );
    
    // Reduce lives on incorrect hit - ONLY by 1
    const newLives = state.lives - 1;
    console.log('Incorrect hit - Lives reduced to:', newLives);
    
    // Check if game over due to no lives left
    if (newLives <= 0) {
      return {
        ...state,
        lives: 0,
        isGameOver: true,
        comboCount: 0,
        letters: updatedLetters,
        lastShotResult: 'miss',
        lastShotLetterId: letterId,
        lastShotTimestamp: Date.now(),
      };
    }
    
    // Reset combo on miss
    return {
      ...state,
      lives: newLives,
      comboCount: 0,
      letters: updatedLetters,
      lastShotResult: 'miss',
      lastShotLetterId: letterId,
      lastShotTimestamp: Date.now(),
    };
  }
};

// Reset the game
export const resetGame = (difficulty: GameDifficulty = 'easy'): GameState => {
  return initializeGame(difficulty);
};