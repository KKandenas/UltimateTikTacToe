// Rum- och lobbyhantering: skapa rum, gå med i rum, spara/återuppta session.

import { db } from "./firebase-config.js";
import {
  ref,
  get,
  set,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
import { createInitialRoomState } from "./gameEngine.js";

const STORAGE_ROOM_KEY = "uttt_room";
const STORAGE_ROLE_KEY = "uttt_role";

function generateRoomCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function isValidRoomCode(code) {
  return /^\d{4}$/.test(code);
}

// Skapar ett nytt rum. Spelaren som skapar rummet blir X.
export async function createRoom(playerId) {
  let code = null;
  for (let attempts = 0; attempts < 10; attempts++) {
    const candidate = generateRoomCode();
    const snap = await get(ref(db, `rooms/${candidate}`));
    if (!snap.exists()) {
      code = candidate;
      break;
    }
  }
  if (!code) {
    throw new Error("no_free_code");
  }

  const initialState = createInitialRoomState(playerId);
  await set(ref(db, `rooms/${code}`), initialState);

  saveSession(code, "X");
  return code;
}

// Går med i ett befintligt rum. Spelaren som ansluter blir O.
// Hanterar även återanslutning om denna spelare redan är X eller O i rummet.
export async function joinRoom(code, playerId) {
  const roomRef = ref(db, `rooms/${code}`);
  const snap = await get(roomRef);
  if (!snap.exists()) {
    throw new Error("room_not_found");
  }
  const room = snap.val();

  if (room.players?.X?.id === playerId) {
    saveSession(code, "X");
    return "X";
  }
  if (room.players?.O?.id === playerId) {
    saveSession(code, "O");
    return "O";
  }
  if (room.players?.O) {
    throw new Error("room_full");
  }

  const result = await runTransaction(roomRef, (current) => {
    if (!current) return current;
    if (current.players?.O) return; // Redan upptaget – avbryt.
    current.players.O = { id: playerId, connected: true };
    current.status = "playing";
    return current;
  });

  if (!result.committed) {
    throw new Error("room_full_race");
  }

  saveSession(code, "O");
  return "O";
}

export function saveSession(roomCode, role) {
  localStorage.setItem(STORAGE_ROOM_KEY, roomCode);
  localStorage.setItem(STORAGE_ROLE_KEY, role);
}

export function getSavedSession() {
  const room = localStorage.getItem(STORAGE_ROOM_KEY);
  const role = localStorage.getItem(STORAGE_ROLE_KEY);
  if (room && role) return { room, role };
  return null;
}

export function clearSavedSession() {
  localStorage.removeItem(STORAGE_ROOM_KEY);
  localStorage.removeItem(STORAGE_ROLE_KEY);
}
