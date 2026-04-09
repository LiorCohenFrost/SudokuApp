import { getGame, getCells, placeNumber, undo } from './game.js';
import { autoFill } from './pencil.js';
import { findNextMove, boardScan } from './solver.js';

const N = 9;

// ── Colour tokens ─────────────────────────────────────────────
const GROUP_COLORS = ['coral', 'purple', 'teal', 'pink', 'amber'];

// ── Main render entry point ───────────────────────────────────
function renderGrid() {
  const game = getGame();
  const cells = getCells();
  const container = document.getElementById('grid');
  if (!container) return;

  if (game.isPaused) {
    container.innerHTML = '<div class="paused-msg">⏸ Paused</div>';
    return;
  }

  container.innerHTML = '';

  for (let i = 0; i < N * N; i++) {
    const cell = cells[i];
    const div = document.createElement('div');
    div.className = 'cell';
    div.dataset.index = i;

    // Border classes for box boundaries
    if (cell.col % 3 === 2) div.classList.add('box-right');
    if (cell.row % 3 === 2) div.classList.add('box-bottom');

    // Value
    const value = game.player[i];
    const isGiven = game.given[i] !== 0;

    if (value !== 0) {
      div.classList.add(isGiven ? 'given' : 'placed');
      div.textContent = value;

      // Conflict detection
      const hasConflict = [...cells[i].peers].some(p => game.player[p] === value);
      if (hasConflict && !isGiven) div.classList.add('conflict');
    } else {
      // Pencil marks
      const marks = game.pencilMarks[i];
      if (marks.size > 0) {
        div.classList.add('pencil-cell');
        const grid = document.createElement('div');
        grid.className = 'pencil-grid';
        for (let n = 1; n <= 9; n++) {
          const span = document.createElement('span');
          if (marks.has(n)) {
            span.textContent = n;
            // Color if part of a group
            if (game.groupNums[i]?.includes(n)) {
              span.style.color = GROUP_COLORS[game.groups[i] % GROUP_COLORS.length];
            }
          }
          grid.appendChild(span);
        }
        div.appendChild(grid);
      }
    }

    // Selection highlighting
    if (game.selectedCell !== null) {
      const sel = game.selectedCell;
      const selVal = game.player[sel];

      if (i === sel) {
        div.classList.add('selected');
      } else if (cells[i].peers.has(sel)) {
        div.classList.add('peer');
        if (selVal !== 0 && game.player[i] === selVal) div.classList.add('same-digit-peer');
      }

      if (selVal !== 0 && game.player[i] === selVal && i !== sel) {
        div.classList.add('same-digit');
      }

      if (selVal !== 0 && game.pencilMarks[i].has(selVal)) {
        div.classList.add('pencil-match');
      }
    }

    // Spotlight (from Code Trainer hint)
    if (game.spotlight) {
      if (i === game.spotlight.target) div.classList.add('spotlight-target');
      else if (game.spotlight.reasons.has(i)) div.classList.add('spotlight-reason');
    }

    // Group outlines
    if (game.groups[i] !== undefined) {
      div.classList.add(`group-${game.groups[i] % GROUP_COLORS.length}`);
    }

    div.addEventListener('click', () => onCellClick(i));
    container.appendChild(div);
  }
}

// ── Numpad ────────────────────────────────────────────────────
function renderNumpad() {
  const game = getGame();
  const container = document.getElementById('numpad');
  if (!container) return;
  container.innerHTML = '';

  for (let n = 1; n <= 9; n++) {
    const count = game.player.filter(v => v === n).length;
    const remaining = 9 - count;
    const btn = document.createElement('button');
    btn.className = 'num-btn';
    btn.dataset.value = n;

    const badge = remaining === 0 ? 'grey'
      : remaining <= 2 ? 'green'
      : remaining <= 4 ? 'blue'
      : 'amber';

    btn.innerHTML = `
      <span class="num-label">${n}</span>
      <span class="num-badge ${badge}">${remaining} left</span>
      <div class="pip-row">${'●'.repeat(count)}${'○'.repeat(remaining)}</div>
    `;

    if (remaining === 0) btn.disabled = true;
    btn.addEventListener('click', () => onNumpad(n));
    container.appendChild(btn);
  }

  // Erase button
  const erase = document.createElement('button');
  erase.className = 'num-btn erase-btn';
  erase.textContent = '⌫';
  erase.addEventListener('click', () => onNumpad(0));
  container.appendChild(erase);
}

// ── Status bar ────────────────────────────────────────────────
function renderStatus() {
  const game = getGame();
  const el = document.getElementById('status');
  if (!el) return;
  el.textContent = `Mistakes: ${game.mistakes.length}  |  Hints: ${game.hintsUsed.length}`;
}

// ── Event handlers ────────────────────────────────────────────
function onCellClick(idx) {
  const game = getGame();
  game.selectedCell = (game.selectedCell === idx) ? null : idx;
  renderGrid();
}

function onNumpad(value) {
  const game = getGame();
  if (game.selectedCell === null) return;
  placeNumber(game.selectedCell, value);
  renderGrid();
  renderNumpad();
  renderStatus();
  if (typeof window._checkCompletion === 'function') window._checkCompletion();
}

// ── Keyboard ──────────────────────────────────────────────────
function attachKeyboard() {
  document.addEventListener('keydown', e => {
    const game = getGame();
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      undo();
      renderGrid();
      renderNumpad();
      renderStatus();
      return;
    }
    if (e.key === 'p' || e.key === 'P') {
      game.pencilMode = !game.pencilMode;
      document.getElementById('pencil-toggle')?.classList.toggle('active', game.pencilMode);
      return;
    }
    if (e.key === 'Escape') {
      game.isPaused = !game.isPaused;
      renderGrid();
      return;
    }
    const digit = parseInt(e.key);
    if (digit >= 1 && digit <= 9) onNumpad(digit);
    if (e.key === 'Backspace' || e.key === 'Delete') onNumpad(0);
  });
}

// ── Public API ────────────────────────────────────────────────
function renderAll() {
  renderGrid();
  renderNumpad();
  renderStatus();
}

export { renderAll, renderGrid, renderNumpad, renderStatus, attachKeyboard };