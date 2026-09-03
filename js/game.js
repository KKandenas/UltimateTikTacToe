// Spelvyn: renderar brädet i realtid från Firebase och skickar drag.

import { db } from "./firebase-config.js";
import {
  ref,
  onValue,
  runTransaction,
  update,
  onDisconnect,
  off,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
import { isMoveLegal, applyMove, resetRoomForRematch } from "./gameEngine.js";
import { t } from "./i18n.js";

let currentRoomCode = null;
let currentRole = null;
let currentRoomRef = null;
let latestRoom = null;
let prevBoardsSnapshot = null;
let callbacks = null;

const cellEls = []; // 9x9 flat list of { boardIndex, cellIndex, el }
const boardEls = []; // 9 mini-board wrapper elements

function otherRole(role) {
  return role === "X" ? "O" : "X";
}

// Bygger DOM-strukturen för brädet en gång. Efterföljande uppdateringar
// sker genom att bara ändra klasser/text, vilket möjliggör animationer.
export function buildBoardDom(container) {
  container.innerHTML = "";
  boardEls.length = 0;
  cellEls.length = 0;

  for (let b = 0; b < 9; b++) {
    const boardEl = document.createElement("div");
    boardEl.className = "mini-board";
    boardEl.dataset.board = String(b);

    for (let c = 0; c < 9; c++) {
      const cellEl = document.createElement("button");
      cellEl.type = "button";
      cellEl.className = "cell";
      cellEl.dataset.board = String(b);
      cellEl.dataset.cell = String(c);
      boardEl.appendChild(cellEl);
      cellEls.push({ boardIndex: b, cellIndex: c, el: cellEl });
    }

    const overlay = document.createElement("div");
    overlay.className = "mini-board-overlay";
    boardEl.appendChild(overlay);

    boardEls.push(boardEl);
    container.appendChild(boardEl);
  }

  container.addEventListener("click", handleBoardClick);
}

// Nollställer brädets DOM-innehåll. Cellernas element återanvänds mellan
// rum (samma DOM-noder över hela appens livstid), så utan detta kan gamla
// X/O bli kvar visuellt när ett nytt spel startar och det nya rummets
// state råkar vara tomt på samma rutor som det förra.
function resetBoardDom() {
  for (const { el } of cellEls) {
    el.textContent = "";
    el.classList.remove("x", "o", "pop", "last-move");
  }
  for (const boardEl of boardEls) {
    boardEl.classList.remove("active", "active-opponent", "won-x", "won-o", "won-d");
    const overlay = boardEl.querySelector(".mini-board-overlay");
    if (overlay) overlay.textContent = "";
  }
}

function handleBoardClick(e) {
  const cellEl = e.target.closest(".cell");
  if (!cellEl || !currentRoomRef) return;
  const boardIndex = Number(cellEl.dataset.board);
  const cellIndex = Number(cellEl.dataset.cell);
  attemptMove(boardIndex, cellIndex);
}

function attemptMove(boardIndex, cellIndex) {
  if (!isMoveLegal(latestRoom, boardIndex, cellIndex, currentRole)) {
    if (latestRoom && latestRoom.status === "playing" && latestRoom.turn !== currentRole) {
      callbacks?.onIllegalMove?.(t("toast_not_your_turn"));
    }
    return;
  }

  runTransaction(currentRoomRef, (room) => {
    if (!room) return room;
    if (!isMoveLegal(room, boardIndex, cellIndex, currentRole)) return; // Avbryt transaktionen.
    return applyMove(room, boardIndex, cellIndex, currentRole);
  }).then((result) => {
    if (result.committed && navigator.vibrate) {
      try {
        navigator.vibrate(10);
      } catch (_) {
        /* ignorera om vibration inte stöds */
      }
    }
  });
}

// Ansluter till ett rum i realtid. `cb` innehåller UI-callbacks för rendering.
export function enterGame(roomCode, role, playerId, cb) {
  currentRoomCode = roomCode;
  currentRole = role;
  currentRoomRef = ref(db, `rooms/${roomCode}`);
  callbacks = cb;
  prevBoardsSnapshot = null;
  resetBoardDom();

  update(ref(db, `rooms/${roomCode}/players/${role}`), { id: playerId, connected: true });
  const connRef = ref(db, `rooms/${roomCode}/players/${role}/connected`);
  onDisconnect(connRef).set(false);

  onValue(currentRoomRef, (snap) => {
    const room = snap.val();
    latestRoom = room;
    if (!room) {
      callbacks?.onRoomMissing?.();
      return;
    }
    render(room);
  });
}

export function leaveGame() {
  if (currentRoomRef) off(currentRoomRef);
  currentRoomRef = null;
  currentRoomCode = null;
  currentRole = null;
  latestRoom = null;
  prevBoardsSnapshot = null;
  callbacks = null;
}

// Startar om samma rum (samma spelare, samma kod) med ett helt tomt bräde.
// Skickas till båda spelarna i realtid via onValue, precis som ett drag.
export function restartGame() {
  if (!currentRoomRef) return;
  runTransaction(currentRoomRef, (room) => {
    if (!room || room.status !== "finished") return room; // Avbryt om spelet inte är slut.
    return resetRoomForRematch(room);
  });
}

function render(room) {
  // Statusfält, delningspanel m.m. hanteras av main.js via callback.
  callbacks?.onStatusUpdate?.(buildStatusInfo(room));

  const isMyTurn = room.status === "playing" && room.turn === currentRole && !room.winner;

  for (let b = 0; b < 9; b++) {
    const boardEl = boardEls[b];
    const boardResult = room.boardWinners[b];
    const isActive =
      room.status === "playing" &&
      !room.winner &&
      !boardResult &&
      (room.activeBoard === -1 || room.activeBoard === b);

    boardEl.classList.toggle("active", isActive && isMyTurn);
    boardEl.classList.toggle("active-opponent", isActive && !isMyTurn);
    boardEl.classList.remove("won-x", "won-o", "won-d");
    if (boardResult === "X") boardEl.classList.add("won-x");
    else if (boardResult === "O") boardEl.classList.add("won-o");
    else if (boardResult === "D") boardEl.classList.add("won-d");

    const overlay = boardEl.querySelector(".mini-board-overlay");
    overlay.textContent = boardResult === "D" ? "=" : boardResult || "";
  }

  for (const { boardIndex, cellIndex, el } of cellEls) {
    const value = room.boards[boardIndex][cellIndex];
    const prevValue = prevBoardsSnapshot ? prevBoardsSnapshot[boardIndex][cellIndex] : "";

    if (value !== prevValue) {
      el.textContent = value;
      el.classList.remove("x", "o");
      if (value === "X") el.classList.add("x");
      else if (value === "O") el.classList.add("o");

      if (value !== "") {
        el.classList.remove("pop");
        // Tvinga reflow så att animationen alltid spelas upp igen.
        void el.offsetWidth;
        el.classList.add("pop");
      }
    }

    const isLastMove = !!(
      room.lastMove &&
      room.lastMove.board === boardIndex &&
      room.lastMove.cell === cellIndex
    );
    el.classList.toggle("last-move", isLastMove);
  }

  prevBoardsSnapshot = room.boards.map((b) => b.slice());

  if (room.status === "finished") {
    callbacks?.onGameOver?.({
      winner: room.winner,
      youWon: room.winner === currentRole,
      isDraw: room.winner === "D",
    });
  } else {
    callbacks?.onGameContinues?.();
  }
}

function buildStatusInfo(room) {
  const opponentRole = otherRole(currentRole);
  const opponentConnected = !!room.players?.[opponentRole]?.connected;

  let text;
  if (room.status === "waiting") {
    text = t("status_waiting");
  } else if (room.status === "playing") {
    text = room.turn === currentRole ? t("status_your_turn") : t("status_opponent_turn");
  } else {
    text =
      room.winner === "D"
        ? t("status_draw")
        : room.winner === currentRole
        ? t("status_you_won")
        : t("status_you_lost");
  }

  return {
    role: currentRole,
    roomCode: currentRoomCode,
    status: room.status,
    text,
    opponentConnected,
    showSharePanel: room.status === "waiting",
  };
}
