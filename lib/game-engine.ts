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
};

// Word lists for different difficulty levels
const wordLists = {
  easy: ['CAT', 'DOG', 'HAT', 'SUN', 'MAP', 'BOOK', 'FISH', 'BALL'],
  medium: ['APPLE', 'HOUSE', 'CHAIR', 'TABLE', 'SMILE', 'LEARN', 'WRITE'],
  hard: ['PYTHON', 'LIBRARY', 'PROGRAM', 'COMPLEX', 'BALANCE', 'QUALITY'],
};

// Generate a random color in hex format
const getRandomColor = (): string => {
  const colors = [
    '#ff9900', '#00aaff', '#ff00aa', '#00ffaa', 
    '#aa00ff', '#ffaa00', '#00ffff', '#ff00ff'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Generate a random position within the game space
const getRandomPosition = (spread: number = 5): [number, number, number] => {
  return [
    (Math.random() - 0.5) * spread * 2, // x
    (Math.random() - 0.5) * spread * 2, // y
    (Math.random() - 0.5) * spread * 2, // z
  ];
};

// Generate a random velocity vector
const getRandomVelocity = (speed: number = 0.01): [number, number, number] => {
  return [
    (Math.random() - 0.5) * speed,
    (Math.random() - 0.5) * speed,
    (Math.random() - 0.5) * speed,
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
    const [x, y, z] = letter.position;
    const [vx, vy, vz] = letter.velocity;
    
    // Update position
    const newPosition: [number, number, number] = [
      x + vx * deltaTime * 60, // Scale by 60 to normalize for approx 60fps
      y + vy * deltaTime * 60,
      z + vz * deltaTime * 60,
    ];
    
    // Bounce if hitting the boundaries
    const boundary = 6;
    const newVelocity = [...letter.velocity] as [number, number, number];
    
    if (Math.abs(newPosition[0]) > boundary) newVelocity[0] *= -1;
    if (Math.abs(newPosition[1]) > boundary) newVelocity[1] *= -1;
    if (Math.abs(newPosition[2]) > boundary) newVelocity[2] *= -1;
    
    return {
      ...letter,
      position: [
        Math.max(-boundary, Math.min(boundary, newPosition[0])),
        Math.max(-boundary, Math.min(boundary, newPosition[1])),
        Math.max(-boundary, Math.min(boundary, newPosition[2])),
      ] as [number, number, number],
      velocity: newVelocity,
    };
  });
  
  return {
    ...state,
    letters: updatedLetters,
    timeRemaining,
  };
};

// Handle player shooting a letter
export const handleLetterShot = (state: GameState, letterId: string): GameState => {
  const letter = state.letters.find(l => l.id === letterId);
  if (!letter) return state;
  
  const targetWord = state.targetWord;
  const currentWord = state.currentWord;
  
  // Check if this is the next letter in the target word
  const nextIndex = currentWord.length;
  if (nextIndex < targetWord.length && letter.character === targetWord[nextIndex]) {
    // Correct letter
    const newCurrentWord = currentWord + letter.character;
    
    // Update the shot letter's state (mark as active/hit)
    const updatedLetters = state.letters.map(l => 
      l.id === letterId ? { ...l, active: true } : l
    );
    
    // Check if word is complete
    if (newCurrentWord === targetWord) {
      // Calculate score based on difficulty and remaining time
      const difficultyMultiplier = 
        state.difficulty === 'easy' ? 1 :
        state.difficulty === 'medium' ? 2 :
        3;
      
      const timeBonus = Math.floor(state.timeRemaining * 0.1);
      const wordScore = 10 * targetWord.length * difficultyMultiplier + timeBonus;
      
      // Get a new target word
      const newState = initializeGame(state.difficulty);
      
      return {
        ...newState,
        score: state.score + wordScore,
        lives: state.lives, // Maintain current lives
      };
    }
    
    return {
      ...state,
      currentWord: newCurrentWord,
      letters: updatedLetters,
    };
  } else {
    // Wrong letter
    const newLives = state.lives - 1;
    
    // Check if game over due to no lives left
    if (newLives <= 0) {
      return {
        ...state,
        lives: 0,
        isGameOver: true,
      };
    }
    
    return {
      ...state,
      lives: newLives,
    };
  }
};

// Reset the game
export const resetGame = (difficulty: GameDifficulty = 'easy'): GameState => {
  return initializeGame(difficulty);
};