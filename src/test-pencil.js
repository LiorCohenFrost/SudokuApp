import { newGame, placeNumber, getGame, getCells } from './game.js';
import { removeCandidateFromPeers, autoFill, clearCell, clearAll } from './pencil.js';

newGame('beginner', 0);
const game = getGame();
const cells = getCells();

// Seed some pencil marks manually
game.pencilMarks[0].add(3);
game.pencilMarks[1].add(3);
game.pencilMarks[9].add(3);

// removeCandidateFromPeers should clear 3 from all peers of cell 0
removeCandidateFromPeers(0, 3);
console.assert(!game.pencilMarks[1].has(3), 'peer in same row cleared');
console.assert(!game.pencilMarks[9].has(3), 'peer in same col cleared');
console.log('✓ removeCandidateFromPeers');

// autoFill should populate candidates for empty cells
autoFill();
const emptyIdx = game.player.findIndex(v => v === 0);
console.assert(game.pencilMarks[emptyIdx].size > 0, 'autoFill populated empty cell');
const filledIdx = game.player.findIndex(v => v !== 0);
console.assert(game.pencilMarks[filledIdx].size === 0, 'autoFill skipped filled cell');
console.log('✓ autoFill');

// clearCell
game.pencilMarks[emptyIdx].add(5);
clearCell(emptyIdx);
console.assert(game.pencilMarks[emptyIdx].size === 0, 'clearCell worked');
console.log('✓ clearCell');

// clearAll
autoFill();
clearAll();
const allEmpty = Object.values(game.pencilMarks).every(s => s.size === 0);
console.assert(allEmpty, 'clearAll wiped everything');
console.log('✓ clearAll');

console.log('✓ pencil.js verified');