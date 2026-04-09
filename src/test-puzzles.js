import { PUZZLES } from './puzzles.js';

// Make PUZZLES exportable first — add this line to the bottom of puzzles.js:
// if (typeof module !== 'undefined') module.exports = { PUZZLES };

const levels = Object.keys(PUZZLES);
console.log('Difficulty levels:', levels);

levels.forEach(level => {
  PUZZLES[level].forEach((p, i) => {
    const puzzleLen = p.puzzle.length;
    const solutionLen = p.solution.length;
    const clues = p.puzzle.split('').filter(c => c !== '0').length;
    console.log(`${level}[${i}] — puzzle: ${puzzleLen} chars, solution: ${solutionLen} chars, clues: ${clues}`);
    console.assert(puzzleLen === 81, `puzzle length wrong`);
    console.assert(solutionLen === 81, `solution length wrong`);
  });
});

console.log('✓ puzzles.js verified');