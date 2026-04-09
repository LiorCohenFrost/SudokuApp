import { getGame, getCells } from './game.js';

/**
 * Returns a Set of valid candidates for a cell based on current board state.
 * Does NOT read pencilMarks — computes from scratch.
 */
function computeCandidates(cellIdx) {
  const { player } = getGame();
  const cells = getCells();
  const used = new Set();
  for (const peerIdx of cells[cellIdx].peers) {
    if (player[peerIdx] !== 0) used.add(player[peerIdx]);
  }
  return new Set([1,2,3,4,5,6,7,8,9].filter(n => !used.has(n)));
}

/**
 * Naked singles: empty cells with exactly one valid candidate.
 * Returns array of { cellIdx, value }
 */
function findNakedSingles() {
  const { player } = getGame();
  const results = [];
  for (let i = 0; i < 81; i++) {
    if (player[i] !== 0) continue;
    const cands = computeCandidates(i);
    if (cands.size === 1) {
      results.push({ cellIdx: i, value: [...cands][0] });
    }
  }
  return results;
}

/**
 * Hidden singles: digits that can only go in one cell within a unit.
 * Returns array of { cellIdx, value, unit }
 */
function findHiddenSingles() {
  const { player } = getGame();
  const { units } = getCells();  // wait — getCells returns array, not gridConfig
  const results = [];

  // Build units manually from cell database
  const cells = getCells();
  const allUnits = buildUnits(cells);

  for (const unit of allUnits) {
    const emptyCells = unit.filter(idx => player[idx] === 0);
    for (let digit = 1; digit <= 9; digit++) {
      // Skip if digit already placed in this unit
      if (unit.some(idx => player[idx] === digit)) continue;
      const canPlace = emptyCells.filter(idx => computeCandidates(idx).has(digit));
      if (canPlace.length === 1) {
        results.push({ cellIdx: canPlace[0], value: digit });
      }
    }
  }

  // Deduplicate by cellIdx+value
  const seen = new Set();
  return results.filter(r => {
    const key = `${r.cellIdx}-${r.value}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Build the 27 units (9 rows + 9 cols + 9 boxes) as arrays of cell indices.
 */
function buildUnits(cells) {
  const N = 9;
  const units = [];
  for (let r = 0; r < N; r++)
    units.push(cells.filter(c => c.row === r).map(c => c.index));
  for (let c = 0; c < N; c++)
    units.push(cells.filter(c2 => c2.col === c).map(c2 => c2.index));
  for (let b = 0; b < N; b++)
    units.push(cells.filter(c => c.box === b).map(c => c.index));
  return units;
}

/**
 * Box groups (naked pairs/triples/quads) — reads pencilMarks, not computed candidates.
 * Returns array of { cells: [idx,...], digits: [n,...], eliminations: [idx,...] }
 */
function findBoxGroups() {
  const { player, pencilMarks } = getGame();
  const cells = getCells();
  const results = [];

  for (let box = 0; box < 9; box++) {
    const boxCells = cells.filter(c => c.box === box && player[c.index] === 0);
    const withMarks = boxCells.filter(c => pencilMarks[c.index].size > 0);

    for (let size = 2; size <= 4; size++) {
      const combos = combinations(withMarks, size);
      for (const combo of combos) {
        const union = new Set(combo.flatMap(c => [...pencilMarks[c.index]]));
        if (union.size === size) {
          const groupIndices = combo.map(c => c.index);
          const outside = boxCells
            .filter(c => !groupIndices.includes(c.index))
            .filter(c => [...union].some(d => pencilMarks[c.index].has(d)))
            .map(c => c.index);
          if (outside.length > 0) {
            results.push({
              cells: groupIndices,
              digits: [...union],
              eliminations: outside,
            });
          }
        }
      }
    }
  }

  return results;
}

/**
 * Find the single easiest available move.
 * Priority: naked single → hidden single → box group
 */
function findNextMove() {
  const naked = findNakedSingles();
  if (naked.length > 0) {
    const { cellIdx, value } = naked[0];
    return {
      technique: 'Naked Single',
      explanation: `Cell <b>R${Math.floor(cellIdx/9)+1}C${cellIdx%9+1}</b> has only one possible candidate: <b>${value}</b>.`,
      target: cellIdx,
      reasons: new Set(getCells()[cellIdx].peers),
    };
  }

  const hidden = findHiddenSingles();
  if (hidden.length > 0) {
    const { cellIdx, value } = hidden[0];
    return {
      technique: 'Hidden Single',
      explanation: `<b>${value}</b> can only go in <b>R${Math.floor(cellIdx/9)+1}C${cellIdx%9+1}</b> within its unit.`,
      target: cellIdx,
      reasons: new Set(),
    };
  }

  const groups = findBoxGroups();
  if (groups.length > 0) {
    const g = groups[0];
    return {
      technique: 'Box Group',
      explanation: `Cells ${g.cells.map(i => `<b>R${Math.floor(i/9)+1}C${i%9+1}</b>`).join(', ')} form a naked group locking digits <b>${g.digits.join(',')}</b> — eliminating from ${g.eliminations.length} other cell(s).`,
      target: g.cells[0],
      reasons: new Set(g.cells.slice(1)),
    };
  }

  return null;
}

/**
 * Board scan — count of each technique currently available.
 */
function boardScan() {
  return {
    nakedSingles: findNakedSingles().length,
    hiddenSingles: findHiddenSingles().length,
    boxGroups: findBoxGroups().length,
  };
}

/**
 * Utility: all combinations of size k from array.
 */
function combinations(arr, k) {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [first, ...rest] = arr;
  return [
    ...combinations(rest, k - 1).map(c => [first, ...c]),
    ...combinations(rest, k),
  ];
}

export { findNakedSingles, findHiddenSingles, findBoxGroups, findNextMove, boardScan, computeCandidates };