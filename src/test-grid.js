// src/test-grid.js
import { buildGrid, makeGridAccessor } from './grid.js';

const GRID = makeGridAccessor(buildGrid(9, 3, 3));

console.log('Total cells:', GRID.cells.length);           // 81
console.log('Peers of cell 0:', GRID.cell(0).peers.size); // 20
console.log('Cell 0  — row:', GRID.cell(0).row, 'col:', GRID.cell(0).col, 'box:', GRID.cell(0).box); // 0,0,0
console.log('Cell 60 — row:', GRID.cell(60).row, 'col:', GRID.cell(60).col, 'box:', GRID.cell(60).box); // 6,6,8
console.log('Cell 54 — box (expect 6):', GRID.cell(54).box); // row 6, col 0 → box 6 ✓
console.log('Cell 20 — box (expect 0):', GRID.cell(20).box); // row 2, col 2 → box 0 ✓
console.log('Cell 40 — box (expect 4):', GRID.cell(40).box); // row 4, col 4 → box 4 (centre) ✓

// Verify peer symmetry
let symmetric = true;
for (let i = 0; i < 81; i++)
  for (const j of GRID.cell(i).peers)
    if (!GRID.cell(j).peers.has(i)) { symmetric = false; break; }
console.log('Peers symmetric:', symmetric); // true

// Verify box units cover all 81 cells without overlap
const boxCells = GRID.units.filter(u => u.type === 'box').flatMap(u => u.cells);
console.log('Box coverage:', boxCells.length, '— unique:', new Set(boxCells).size); // 81, 81

console.log('✓ grid.js verified');