import { newGame, getGame } from './game.js';
import { autoFill } from './pencil.js';
import { findNakedSingles, findHiddenSingles, findBoxGroups, findNextMove, boardScan } from './solver.js';

newGame('beginner', 0);

// Naked singles
const naked = findNakedSingles();
console.log(`Naked singles found: ${naked.length}`);
console.assert(Array.isArray(naked), 'naked singles returns array');
console.log('✓ findNakedSingles');

// Hidden singles
const hidden = findHiddenSingles();
console.log(`Hidden singles found: ${hidden.length}`);
console.assert(Array.isArray(hidden), 'hidden singles returns array');
console.log('✓ findHiddenSingles');

// Box groups — need pencil marks first
autoFill();
const groups = findBoxGroups();
console.log(`Box groups found: ${groups.length}`);
console.assert(Array.isArray(groups), 'box groups returns array');
console.log('✓ findBoxGroups');

// Next move
const move = findNextMove();
console.assert(move !== null, 'next move found');
console.assert(move.technique, 'move has technique');
console.assert(typeof move.target === 'number', 'move has target cell');
console.log(`Next move: ${move.technique} → cell ${move.target}`);
console.log('✓ findNextMove');

// Board scan
const scan = boardScan();
console.log('Board scan:', scan);
console.assert(typeof scan.nakedSingles === 'number', 'scan has nakedSingles');
console.assert(typeof scan.hiddenSingles === 'number', 'scan has hiddenSingles');
console.assert(typeof scan.boxGroups === 'number', 'scan has boxGroups');
console.log('✓ boardScan');

console.log('✓ solver.js verified');