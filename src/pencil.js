import { getGame, getCells } from './game.js';

/**
 * Remove a candidate value from all peers of a cell.
 * Called unconditionally on every placement (correct or wrong).
 */
function removeCandidateFromPeers(cellIdx, value) {
  const { pencilMarks } = getGame();
  const cells = getCells();
  for (const peerIdx of cells[cellIdx].peers) {
    pencilMarks[peerIdx].delete(value);
  }
}

/**
 * Auto-fill candidates for all empty cells based on current board state.
 * Replaces existing pencil marks entirely.
 */
function autoFill() {
  const game = getGame();
  const cells = getCells();
  for (let i = 0; i < 81; i++) {
    if (game.player[i] !== 0) {
      game.pencilMarks[i] = new Set();
      continue;
    }
    const used = new Set();
    for (const peerIdx of cells[i].peers) {
      if (game.player[peerIdx] !== 0) used.add(game.player[peerIdx]);
    }
    game.pencilMarks[i] = new Set([1,2,3,4,5,6,7,8,9].filter(n => !used.has(n)));
  }
}

/**
 * Clear all pencil marks from a single cell.
 */
function clearCell(cellIdx) {
  getGame().pencilMarks[cellIdx].clear();
}

/**
 * Clear all pencil marks from the entire board.
 */
function clearAll() {
  const { pencilMarks } = getGame();
  for (let i = 0; i < 81; i++) pencilMarks[i].clear();
}

export { removeCandidateFromPeers, autoFill, clearCell, clearAll };