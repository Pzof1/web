const SIZE = 4;
const boardElement = document.querySelector("#board");
const tileLayer = document.querySelector("#tiles");
const scoreOutput = document.querySelector("#score");
const message = document.querySelector("#game-message");
const gameOverDialog = document.querySelector("#game-over");
const finalScore = document.querySelector("#final-score");
const mobileControls = document.querySelector("#mobile-controls");
const tileElements = new Map();

let nextTileId = 1;
let board = [];
let score = 0;
let gameOver = false;
let touchStart = null;

function createTile(value, fresh = false) {
  return { id: nextTileId++, value, fresh, merged: false };
}

function makeEmptyBoard() {
  return Array(SIZE * SIZE).fill(null);
}

function createBackgroundCells() {
  const cells = document.querySelector(".board__cells");
  for (let index = 0; index < SIZE * SIZE; index += 1) {
    cells.append(document.createElement("span"));
  }
}

function emptyIndexes() {
  return board.flatMap((tile, index) => tile === null ? [index] : []);
}

function spawnTile() {
  const empty = emptyIndexes();
  if (empty.length === 0) return false;
  const index = empty[Math.floor(Math.random() * empty.length)];
  board[index] = createTile(Math.random() < 0.1 ? 4 : 2, true);
  return true;
}

function getTilePositions() {
  return new Map([...tileElements].map(([id, element]) => [id, element.getBoundingClientRect()]));
}

function renderBoard(previousPositions = new Map()) {
  const activeIds = new Set();
  const animatedElements = [];

  board.forEach((tile, index) => {
    if (!tile) return;
    activeIds.add(tile.id);
    let element = tileElements.get(tile.id);
    const isNew = !element;
    if (!element) {
      element = document.createElement("div");
      element.className = "tile";
      element.setAttribute("role", "gridcell");
      tileElements.set(tile.id, element);
      tileLayer.append(element);
    }

    const row = Math.floor(index / SIZE);
    const column = index % SIZE;
    element.style.gridRowStart = String(row + 1);
    element.style.gridColumnStart = String(column + 1);
    element.dataset.value = String(tile.value);
    element.textContent = String(tile.value);
    element.setAttribute("aria-label", `Плитка ${tile.value}, строка ${row + 1}, столбец ${column + 1}`);
    element.classList.toggle("tile--large", tile.value > 2048);

    if (tile.fresh || isNew) {
      element.classList.add("tile--new");
      element.addEventListener("animationend", () => element.classList.remove("tile--new"), { once: true });
      tile.fresh = false;
    }
    if (tile.merged) {
      element.classList.add("tile--merged");
      element.addEventListener("animationend", () => element.classList.remove("tile--merged"), { once: true });
      tile.merged = false;
    }

    const previousRect = previousPositions.get(tile.id);
    if (previousRect && !isNew) animatedElements.push([element, previousRect]);
  });

  for (const [id, element] of tileElements) {
    if (activeIds.has(id)) continue;
    element.remove();
    tileElements.delete(id);
  }

  scoreOutput.value = String(score);
  scoreOutput.textContent = String(score);

  if (animatedElements.length > 0) {
    requestAnimationFrame(() => {
      for (const [element, previousRect] of animatedElements) {
        const currentRect = element.getBoundingClientRect();
        const offsetX = previousRect.left - currentRect.left;
        const offsetY = previousRect.top - currentRect.top;
        element.style.transition = "none";
        element.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      }
      tileLayer.offsetHeight;
      requestAnimationFrame(() => {
        for (const [element] of animatedElements) {
          element.style.transition = "";
          element.style.transform = "";
        }
      });
    });
  }
}

function indexesForLine(direction, line) {
  if (direction === "left") return Array.from({ length: SIZE }, (_, column) => line * SIZE + column);
  if (direction === "right") return Array.from({ length: SIZE }, (_, offset) => line * SIZE + (SIZE - 1 - offset));
  if (direction === "up") return Array.from({ length: SIZE }, (_, row) => row * SIZE + line);
  return Array.from({ length: SIZE }, (_, offset) => (SIZE - 1 - offset) * SIZE + line);
}

function moveLine(indexes) {
  const tiles = indexes.map((index) => board[index]).filter(Boolean);
  const result = [];
  let gained = 0;

  for (let offset = 0; offset < tiles.length; offset += 1) {
    const current = tiles[offset];
    const next = tiles[offset + 1];
    if (next && current.value === next.value) {
      const mergedValue = current.value * 2;
      result.push({ ...createTile(mergedValue), merged: true });
      gained += mergedValue;
      offset += 1;
    } else {
      result.push(current);
    }
  }

  const updated = [...result, ...Array(SIZE - result.length).fill(null)];
  const changed = indexes.some((index, position) => board[index]?.id !== updated[position]?.id);
  indexes.forEach((index, position) => { board[index] = updated[position]; });
  return { changed, gained };
}

function hasAvailableMove() {
  for (let row = 0; row < SIZE; row += 1) {
    for (let column = 0; column < SIZE; column += 1) {
      const index = row * SIZE + column;
      const tile = board[index];
      if (!tile) return true;
      if (column < SIZE - 1 && tile.value === board[index + 1]?.value) return true;
      if (row < SIZE - 1 && tile.value === board[index + SIZE]?.value) return true;
    }
  }
  return false;
}

function setGameOver(isFinished) {
  gameOver = isFinished;
  mobileControls.hidden = isFinished;
  gameOverDialog.hidden = !isFinished;
  if (isFinished) {
    finalScore.textContent = String(score);
    message.textContent = "Поле заполнено, возможных объединений больше нет.";
    document.querySelector("#play-again").focus();
  }
}

function move(direction) {
  if (gameOver) return;
  const previousPositions = getTilePositions();
  let changed = false;
  let gained = 0;

  for (let line = 0; line < SIZE; line += 1) {
    const result = moveLine(indexesForLine(direction, line));
    changed ||= result.changed;
    gained += result.gained;
  }
  if (!changed) return;

  score += gained;
  const spawnCount = 1 + (Math.random() < 0.12 ? 1 : 0);
  for (let count = 0; count < spawnCount; count += 1) spawnTile();

  renderBoard(previousPositions);
  message.textContent = gained > 0 ? `Хороший ход! +${gained} очков.` : "Ход принят.";
  setGameOver(!hasAvailableMove());
}

function startNewGame() {
  board = makeEmptyBoard();
  score = 0;
  setGameOver(false);
  const startingTileCount = 1 + Math.floor(Math.random() * 3);
  for (let count = 0; count < startingTileCount; count += 1) spawnTile();
  message.textContent = "Используйте стрелки на клавиатуре, кнопки или свайп.";
  renderBoard();
}

function directionFromKey(key) {
  return ({ ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" })[key];
}

createBackgroundCells();
document.querySelector("#new-game").addEventListener("click", startNewGame);
document.querySelector("#play-again").addEventListener("click", startNewGame);
mobileControls.addEventListener("click", (event) => {
  const button = event.target.closest("[data-direction]");
  if (button) move(button.dataset.direction);
});

document.addEventListener("keydown", (event) => {
  const direction = directionFromKey(event.key);
  if (!direction || event.target.closest("input, textarea, select, button, a")) return;
  event.preventDefault();
  move(direction);
});

boardElement.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "touch" || gameOver) return;
  touchStart = { x: event.clientX, y: event.clientY };
});

boardElement.addEventListener("pointerup", (event) => {
  if (!touchStart) return;
  const deltaX = event.clientX - touchStart.x;
  const deltaY = event.clientY - touchStart.y;
  touchStart = null;
  if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 28) return;
  const direction = Math.abs(deltaX) > Math.abs(deltaY)
    ? (deltaX > 0 ? "right" : "left")
    : (deltaY > 0 ? "down" : "up");
  move(direction);
});

boardElement.addEventListener("pointercancel", () => { touchStart = null; });

startNewGame();
