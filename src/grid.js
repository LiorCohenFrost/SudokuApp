// ─────────────────────────────────────────────────────────────
// grid.js — Cell database
//
// The single source of truth for grid topology.
// Every cell knows its own row, col, box, and peers.
// Nothing else in the app computes these — they always ask the cell.
//
// To extend to 16×16: call buildGrid(16, 4, 4)
// ─────────────────────────────────────────────────────────────

/**
 * @typedef {Object} Cell
 * @property {number} index  - flat array index (0–80 for 9×9)
 * @property {number} row    - 0-based row
 * @property {number} col    - 0-based column
 * @property {number} box    - 0-based box
 * @property {Set<number>} peers - indices of all cells sharing a unit
 */

/**
 * Builds a complete cell database for an N×N Sudoku grid.
 *
 * @param {number} N        - grid size (9 for standard)
 * @param {number} boxRows  - rows per box (3 for standard)
 * @param {number} boxCols  - cols per box (3 for standard)
 * @returns {GridConfig}
 */
export function buildGrid(N = 9, boxRows = 3, boxCols = 3) {
  const total = N * N;

  // Step 1: assign row, col, box to every cell
  const cells = Array.from({ length: total }, (_, index) => {
    const row = Math.floor(index / N);
    const col = index % N;
    const box = Math.floor(row / boxRows) * (N / boxCols) + Math.floor(col / boxCols);
    return { index, row, col, box, peers: new Set() };
  });

  // Step 2: build peer sets
  // Two cells are peers if they share a row, column, or box
  for (let i = 0; i < total; i++) {
    for (let j = 0; j < total; j++) {
      if (i === j) continue;
      const a = cells[i], b = cells[j];
      if (a.row === b.row || a.col === b.col || a.box === b.box) {
        a.peers.add(j);
      }
    }
  }

  // Step 3: build unit lists
  // Units are the 27 groups (9 rows + 9 cols + 9 boxes) used by the solver
  const units = [];

  for (let r = 0; r < N; r++)
    units.push({
      type: 'row',
      label: `row ${r + 1}`,
      cells: cells.filter(c => c.row === r).map(c => c.index)
    });

  for (let c = 0; c < N; c++)
    units.push({
      type: 'col',
      label: `col ${c + 1}`,
      cells: cells.filter(c2 => c2.col === c).map(c2 => c2.index)
    });

  const numBoxes = (N / boxRows) * (N / boxCols);
  for (let b = 0; b < numBoxes; b++) {
    const br = Math.floor(b / (N / boxCols)) + 1;
    const bc = (b % (N / boxCols)) + 1;
    units.push({
      type: 'box',
      label: `box(${br},${bc})`,
      boxIndex: b,
      cells: cells.filter(c => c.box === b).map(c => c.index)
    });
  }

  return { cells, N, boxRows, boxCols, units };
}

/**
 * Convenience: get a cell object by flat index.
 * Usage: GRID.cell(i).row, GRID.cell(i).peers, etc.
 */
export function makeGridAccessor(gridConfig) {
  return {
    ...gridConfig,
    cell: (i) => gridConfig.cells[i],
    arePeers: (i, j) => gridConfig.cells[i].peers.has(j),
  };
}