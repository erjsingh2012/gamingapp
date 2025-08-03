const boardData = [
  ["TW", "", "", "DL", "", "", "DL", "", "", "", "TW"],
  ["", "DW", "", "", "", "TL", "", "", "", "DW", ""],
  ["", "", "DW", "", "", "", "", "", "DW", "", ""],
  ["DL", "", "", "DW", "", "", "", "DW", "", "", "DL"],
  ["", "", "", "", "DW", "", "DW", "", "", "", ""],
  ["", "TL", "", "", "", "★", "", "", "", "TL", ""],
  ["", "", "", "", "DW", "", "DW", "", "", "", ""],
  ["DL", "", "", "DW", "", "", "", "DW", "", "", "DL"],
  ["", "", "DW", "", "", "", "", "", "DW", "", ""],
  ["", "DW", "", "", "", "TL", "", "", "", "DW", ""],
  ["TW", "", "", "DL", "", "", "DL", "", "", "", "TW"],
];

const tileBag = [
  ...Array(9).fill("A"),
  ...Array(2).fill("B"),
  ...Array(2).fill("C"),
  ...Array(4).fill("D"),
  ...Array(12).fill("E"),
  ...Array(2).fill("F"),
  ...Array(3).fill("G"),
  ...Array(2).fill("H"),
  ...Array(9).fill("I"),
  ...Array(1).fill("J"),
  ...Array(1).fill("K"),
  ...Array(4).fill("L"),
  ...Array(2).fill("M"),
  ...Array(6).fill("N"),
  ...Array(8).fill("O"),
  ...Array(2).fill("P"),
  ...Array(1).fill("Q"),
  ...Array(6).fill("R"),
  ...Array(4).fill("S"),
  ...Array(6).fill("T"),
  ...Array(4).fill("U"),
  ...Array(2).fill("V"),
  ...Array(2).fill("W"),
  ...Array(1).fill("X"),
  ...Array(2).fill("Y"),
  ...Array(1).fill("Z"),
  ...Array(2).fill("_"),
];

const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
};

const drawTiles = (count) => {
  shuffle(tileBag);
  return tileBag.splice(0, count);
};

const populateRack = (tiles) => {
  const rack = document.getElementById("rack");
  rack.innerHTML = "";
  tiles.forEach((letter) => {
    const tile = document.createElement("span");
    tile.textContent = letter;
    rack.appendChild(tile);
  });
};

const populateBoard = () => {
  const board = document.getElementById("board");
  boardData.forEach((row) => {
    row.forEach((cell) => {
      const tile = document.createElement("div");
      tile.className = "tile " + (cell || "");
      tile.textContent = cell || "";
      board.appendChild(tile);
    });
  });
  const initBoardTileClick = () => {
    document.getElementById("board").addEventListener("click", (e) => {
      const tile = e.target;
      if (!tile.classList.contains("placed-tile")) return;

      // Try to find an empty placeholder in rack
      const rackSpans = [...document.querySelectorAll("#rack span")];
      const emptySpot = rackSpans.find((span) => span.dataset.empty === "true");

      if (emptySpot) {
        emptySpot.textContent = tile.dataset.letter;
        emptySpot.classList.remove("rack-placeholder");
        delete emptySpot.dataset.empty;

        // Clear the board tile
        const cellText = tile.dataset.originalCell || ""; // fallback to empty
        tile.textContent = cellText;
        tile.classList.remove("placed-tile");
        delete tile.dataset.letter;
      }
    });
  };
  initBoardTileClick();
};

// Initialize game
populateBoard();
populateRack(drawTiles(7));

let draggedTile = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let originX = 0;
let originY = 0;

const initDraggableRackTiles = () => {
  const rack = document.getElementById("rack");

  rack.addEventListener("pointerdown", (e) => {
    const target = e.target;
    if (target.tagName !== "SPAN") return;

    // Store origin for delta calculation
    originX = e.clientX;
    originY = e.clientY;

    // Create floating clone
    draggedTile = target.cloneNode(true);
    draggedTile.style.position = "fixed";
    draggedTile.style.zIndex = "1000";
    draggedTile.style.pointerEvents = "none";
    draggedTile.style.opacity = "0.9";
    draggedTile.style.transform = "scale(5.0)";
    document.body.appendChild(draggedTile);

    // Instead of using tile size, use a fixed slight offset
    dragOffsetX = 25; // adjust horizontally
    dragOffsetY = 25; // adjust vertically

    moveDraggedTile(e);
  });

  document.addEventListener("pointermove", (e) => {
    if (!draggedTile) return;
    moveDraggedTile(e);

    // Calculate movement delta
    const deltaX = e.clientX - originX;
    const deltaY = e.clientY - originY;
    // For debugging:
    // console.log(`Moved X: ${deltaX}px, Y: ${deltaY}px`);
  });

  document.addEventListener("pointerup", () => {
    if (draggedTile) {
      draggedTile.remove();
      draggedTile = null;
    }
  });

  const moveDraggedTile = (e) => {
    if (!draggedTile) return;
    draggedTile.style.left = `${e.clientX - dragOffsetX}px`;
    draggedTile.style.top = `${e.clientY - dragOffsetY}px`;
  };
};

const dropTileOnBoard = () => {
  if (!draggedTile) return;

  const rect = draggedTile.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const target = document.elementFromPoint(centerX, centerY);

  if (target && target.classList.contains("tile")) {
    const cellText = target.textContent.trim();
    const isBonusCell = ["TW", "DW", "TL", "DL", "★"].includes(cellText);

    if (cellText === "" || isBonusCell) {
      // Step 1a: Place the tile on the board
      target.textContent = draggedTile.textContent;

      target.classList.add("placed-tile");
      target.dataset.letter = draggedTile.textContent;

      // Step 1b: Replace the tile in the rack with a placeholder
      const rackSpans = [...document.querySelectorAll("#rack span")];
      const match = rackSpans.find(
        (span) =>
          span.textContent === draggedTile.textContent && !span.dataset.empty
      );
      if (match) {
        match.textContent = "\u00A0";
        match.dataset.empty = "true";
        match.classList.add("rack-placeholder");
      }
    }
  }
};

document.addEventListener("pointerup", (e) => {
  if (draggedTile) {
    dropTileOnBoard(e);
    draggedTile.remove();
    draggedTile = null;
  }
});
const rackTiles = drawTiles(7);
populateRack(rackTiles);
initDraggableRackTiles();
