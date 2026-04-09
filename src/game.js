import { buildGrid } from './grid.js';
import { PUZZLES } from './puzzles.js';

const N = 9;
const { cells } = buildGrid(N, 3, 3);

let game = {};

function newGame(difficulty = 'beginner', puzzleIndex = 0) {
  const { puzzle, solution } = PUZZLES[difficulty][puzzleIndex];

  const player = puzzle.split('').map(Number);
  const given  = puzzle.split('').map(Number);

  const pencilMarks = {};
  for (let i = 0; i < N * N; i++) pencilMarks[i] = new Set();

  game = {
    puzzle, solution: solution.split('').map(Number),
    player, given,
    pencilMarks,
    selectedCell: null,
    pencilMode: false,
    difficulty,
    mistakes: [],
    hintsUsed: [],
    aiHistory: [],
    elapsed: 0,
    startTime: Date.now(),
    timerHandle: null,
    isComplete: false,
    lastMistake: null,
    isPaused: false,
    groups: {},
    groupNums: {},
    undoStack: [],
    spotlight: null,
  };

  return game;
}

function pushUndo() {
  if (game.undoStack.length >= 100) game.undoStack.shift();
  game.undoStack.push({
    player: [...game.player],
    pencilMarks: Object.fromEntries(
      Object.entries(game.pencilMarks).map(([k, v]) => [k, new Set(v)])
    ),
    mistakes: [...game.mistakes],
  });
}

function applySnapshot(snapshot) {
  game.player = [...snapshot.player];
  game.mistakes = [...snapshot.mistakes];
  for (const [k, v] of Object.entries(snapshot.pencilMarks)) {
    game.pencilMarks[k] = new Set(v);
  }
}

function undo() {
  if (game.undoStack.length === 0) return false;
  applySnapshot(game.undoStack.pop());
  return true;
}

function placeNumber(cellIdx, value) {
  if (game.given[cellIdx] !== 0) return { type: 'given' };
  if (game.isComplete) return { type: 'complete' };

  pushUndo();

  if (game.pencilMode) {
    const marks = game.pencilMarks[cellIdx];
    if (value === 0) { marks.clear(); return { type: 'pencil-clear' }; }
    marks.has(value) ? marks.delete(value) : marks.add(value);
    return { type: 'pencil-toggle', value };
  }

  // Place a digit
  game.player[cellIdx] = value;
  game.pencilMarks[cellIdx].clear();

  // Remove candidate from peers unconditionally
  for (const peerIdx of cells[cellIdx].peers) {
    game.pencilMarks[peerIdx].delete(value);
  }

  if (value === 0) return { type: 'erase' };

  const correct = value === game.solution[cellIdx];
  if (!correct) {
    game.mistakes.push({
      cell: cellIdx,
      wrong: value,
      correct: game.solution[cellIdx],
      elapsed: game.elapsed,
    });
    game.lastMistake = cellIdx;
  }

  // Check completion
  const done = game.player.every((v, i) => v === game.solution[i]);
  if (done) game.isComplete = true;

  return { type: correct ? 'correct' : 'wrong', correct, done: game.isComplete };
}

function getGame() { return game; }
function getCells() { return cells; }

export { newGame, placeNumber, pushUndo, undo, getGame, getCells };