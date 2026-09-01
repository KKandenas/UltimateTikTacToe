// Ren spellogik för Ultimate Tic-Tac-Toe – inga beroenden till Firebase eller DOM.
// Kan återanvändas oförändrad både i klienten och i en Firebase-transaction.

export const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

// Hittar en vinnare (X/O) i en rad av 9 celler, annars null.
export function checkLineWinner(cells) {
  for (const [a, b, c] of WIN_LINES) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return cells[a];
    }
  }
  return null;
}

// Resultat för ett litet bräde: "X" | "O" | "D" (oavgjort) | "" (pågår).
export function computeBoardResult(cells) {
  const winner = checkLineWinner(cells);
  if (winner) return winner;
  if (cells.every((c) => c !== "")) return "D";
  return "";
}

export function createEmptyBoards() {
  return Array.from({ length: 9 }, () => Array(9).fill(""));
}

export function createEmptyBoardWinners() {
  return Array(9).fill("");
}

// Det övergripande resultatet baserat på de 9 småbrädenas resultat.
// "D" (oavgjort bräde) räknas inte som någon symbol i storbrädet.
export function getOverallResult(boardWinners) {
  const metaCells = boardWinners.map((w) => (w === "D" ? "" : w));
  const winner = checkLineWinner(metaCells);
  if (winner) return winner;
  if (boardWinners.every((w) => w !== "")) return "D";
  return "";
}

// Skapar ett helt nytt rum-state (så som det lagras i Firebase).
export function createInitialRoomState(hostPlayerId) {
  return {
    status: "waiting", // waiting | playing | finished
    turn: "X",
    activeBoard: -1, // -1 = valfritt öppet bräde ("frikort")
    boards: createEmptyBoards(),
    boardWinners: createEmptyBoardWinners(),
    winner: "",
    moveCount: 0,
    players: {
      X: { id: hostPlayerId, connected: true },
      O: null,
    },
    createdAt: Date.now(),
    lastMove: null,
  };
}

// Återställer ett rum till en ny match: samma spelare och rumskod,
// men helt tomt bräde och X börjar om.
export function resetRoomForRematch(room) {
  return {
    ...room,
    status: "playing",
    turn: "X",
    activeBoard: -1,
    boards: createEmptyBoards(),
    boardWinners: createEmptyBoardWinners(),
    winner: "",
    moveCount: 0,
    lastMove: null,
  };
}

// Kontrollerar om ett drag är lagligt givet nuvarande rum-state.
export function isMoveLegal(room, boardIndex, cellIndex, role) {
  if (!room || room.status !== "playing") return false;
  if (room.winner) return false;
  if (room.turn !== role) return false;
  if (boardIndex < 0 || boardIndex > 8 || cellIndex < 0 || cellIndex > 8) return false;
  if (room.activeBoard !== -1 && room.activeBoard !== boardIndex) return false;
  if (room.boardWinners[boardIndex]) return false;
  if (room.boards[boardIndex][cellIndex] !== "") return false;
  return true;
}

// Applicerar ett (redan validerat) drag och returnerar ett nytt rum-state.
export function applyMove(room, boardIndex, cellIndex, role) {
  const boards = room.boards.map((b) => b.slice());
  boards[boardIndex][cellIndex] = role;

  const boardWinners = room.boardWinners.slice();
  const boardResult = computeBoardResult(boards[boardIndex]);
  if (boardResult) boardWinners[boardIndex] = boardResult;

  const overall = getOverallResult(boardWinners);

  const newRoom = {
    ...room,
    boards,
    boardWinners,
    moveCount: (room.moveCount || 0) + 1,
    lastMove: { board: boardIndex, cell: cellIndex, player: role, t: Date.now() },
  };

  if (overall) {
    newRoom.winner = overall;
    newRoom.status = "finished";
  } else {
    // Cellens index i det lilla brädet styr vilket bräde motståndaren tvingas till.
    // Om det brädet redan är avgjort (vunnet/oavgjort) blir det fritt val.
    newRoom.turn = role === "X" ? "O" : "X";
    newRoom.activeBoard = boardWinners[cellIndex] ? -1 : cellIndex;
  }

  return newRoom;
}
