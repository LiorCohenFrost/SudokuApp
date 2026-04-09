import { buildGrid } from './grid.js';
import { newGame, placeNumber, undo, getGame } from './game.js';

const game = newGame('beginner', 0);

// Basic structure
console.assert(game.player.length === 81, 'player array length');
console.assert(game.solution.length === 81, 'solution array length');
console.assert(Object.keys(game.pencilMarks).length === 81, 'pencilMarks keys');
console.log('✓ newGame structure');

// Given clues are non-zero where puzzle has digits
const firstClue = game.player.findIndex(v => v !== 0);
const result = placeNumber(firstClue, 5);
console.assert(result.type === 'given', 'cannot overwrite given clue');
console.log('✓ given clue protection');

// Place a correct answer in first empty cell
const emptyIdx = game.player.findIndex(v => v === 0);
const correctVal = game.solution[emptyIdx];
const r1 = placeNumber(emptyIdx, correctVal);
console.assert(r1.type === 'correct', 'correct placement recognized');
console.assert(game.player[emptyIdx] === correctVal, 'value written to player');
console.log('✓ correct placement');

// Undo restores state
undo();
console.assert(game.player[emptyIdx] === 0, 'undo restored cell');
console.log('✓ undo works');

// Wrong placement increments mistakes
const emptyIdx2 = game.player.findIndex(v => v === 0);
const wrongVal = (game.solution[emptyIdx2] % 9) + 1 === game.solution[emptyIdx2]
  ? (game.solution[emptyIdx2] % 9) + 2
  : (game.solution[emptyIdx2] % 9) + 1;
placeNumber(emptyIdx2, wrongVal === game.solution[emptyIdx2] ? (wrongVal % 9) + 1 : wrongVal);
console.assert(game.mistakes.length === 1, 'mistake recorded');
console.log('✓ mistake tracking');

console.log('✓ game.js verified');