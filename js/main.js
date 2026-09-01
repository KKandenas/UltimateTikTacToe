// Startpunkt: hanterar autentisering, skärmbyten och kopplar ihop
// lobby.js och game.js med DOM:en.

import { auth } from "./firebase-config.js";
import {
  signInAnonymously,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  createRoom,
  joinRoom,
  isValidRoomCode,
  getSavedSession,
  clearSavedSession,
} from "./lobby.js";
import { enterGame, leaveGame, restartGame, buildBoardDom } from "./game.js";

const el = {
  lobbyScreen: document.getElementById("lobby-screen"),
  gameScreen: document.getElementById("game-screen"),
  tabBtns: document.querySelectorAll(".tab-btn"),
  tabCreate: document.getElementById("tab-create"),
  tabJoin: document.getElementById("tab-join"),
  createRoomBtn: document.getElementById("create-room-btn"),
  joinRoomBtn: document.getElementById("join-room-btn"),
  joinCodeInput: document.getElementById("join-code-input"),
  lobbyError: document.getElementById("lobby-error"),

  roleBadge: document.getElementById("role-badge"),
  roomCodeTag: document.getElementById("room-code-tag"),
  statusText: document.getElementById("status-text"),
  leaveBtn: document.getElementById("leave-btn"),
  gameBoard: document.getElementById("game-board"),
  sharePanel: document.getElementById("share-panel"),
  shareCode: document.getElementById("share-code"),
  copyLinkBtn: document.getElementById("copy-link-btn"),

  gameoverModal: document.getElementById("gameover-modal"),
  gameoverTitle: document.getElementById("gameover-title"),
  gameoverDesc: document.getElementById("gameover-desc"),
  gameoverRestartBtn: document.getElementById("gameover-restart-btn"),
  gameoverLeaveBtn: document.getElementById("gameover-leave-btn"),

  rulesModal: document.getElementById("rules-modal"),
  rulesLinkLobby: document.getElementById("rules-link-lobby"),
  rulesLinkGame: document.getElementById("rules-link-game"),
  rulesCloseBtn: document.getElementById("rules-close-btn"),

  toast: document.getElementById("toast"),
};

let toastTimeout = null;
function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.remove("hidden");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => el.toast.classList.add("hidden"), 2200);
}

function showLobbyError(message) {
  el.lobbyError.textContent = message;
  el.lobbyError.classList.toggle("hidden", !message);
}

function showScreen(name) {
  el.lobbyScreen.classList.toggle("hidden", name !== "lobby");
  el.gameScreen.classList.toggle("hidden", name !== "game");
}

function setButtonsBusy(busy) {
  el.createRoomBtn.disabled = busy;
  el.joinRoomBtn.disabled = busy;
}

buildBoardDom(el.gameBoard);

// --- Lobby-flikar -----------------------------------------------------
el.tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    el.tabBtns.forEach((b) => b.classList.toggle("active", b === btn));
    const tab = btn.dataset.tab;
    el.tabCreate.classList.toggle("hidden", tab !== "create");
    el.tabJoin.classList.toggle("hidden", tab !== "join");
    showLobbyError("");
  });
});

el.joinCodeInput.addEventListener("input", () => {
  el.joinCodeInput.value = el.joinCodeInput.value.replace(/\D/g, "").slice(0, 4);
});

// --- Skapa / gå med -----------------------------------------------------
el.createRoomBtn.addEventListener("click", async () => {
  showLobbyError("");
  setButtonsBusy(true);
  try {
    const playerId = requirePlayerId();
    const code = await createRoom(playerId);
    startGame(code, "X", playerId);
  } catch (err) {
    showLobbyError(err.message || "Något gick fel. Försök igen.");
  } finally {
    setButtonsBusy(false);
  }
});

el.joinRoomBtn.addEventListener("click", async () => {
  showLobbyError("");
  const code = el.joinCodeInput.value.trim();
  if (!isValidRoomCode(code)) {
    showLobbyError("Ange en giltig 4-siffrig rumskod.");
    return;
  }
  setButtonsBusy(true);
  try {
    const playerId = requirePlayerId();
    const role = await joinRoom(code, playerId);
    startGame(code, role, playerId);
  } catch (err) {
    showLobbyError(err.message || "Något gick fel. Försök igen.");
  } finally {
    setButtonsBusy(false);
  }
});

// --- Lämna rum ------------------------------------------------------------
function returnToLobby() {
  leaveGame();
  clearSavedSession();
  el.gameoverModal.classList.add("hidden");
  showScreen("lobby");
  showLobbyError("");
}

el.leaveBtn.addEventListener("click", returnToLobby);
el.gameoverLeaveBtn.addEventListener("click", returnToLobby);

el.gameoverRestartBtn.addEventListener("click", () => {
  restartGame();
  el.gameoverModal.classList.add("hidden");
});

// --- Spelregler ---------------------------------------------------------
function openRules() {
  el.rulesModal.classList.remove("hidden");
}
function closeRules() {
  el.rulesModal.classList.add("hidden");
}
el.rulesLinkLobby.addEventListener("click", openRules);
el.rulesLinkGame.addEventListener("click", openRules);
el.rulesCloseBtn.addEventListener("click", closeRules);

// --- Dela länk --------------------------------------------------------
el.copyLinkBtn.addEventListener("click", async () => {
  const url = `${location.origin}${location.pathname}?room=${el.shareCode.textContent}`;
  try {
    await navigator.clipboard.writeText(url);
    showToast("Länk kopierad!");
  } catch (_) {
    showToast(url);
  }
});

// --- Spelvyn ------------------------------------------------------------
function startGame(roomCode, role, playerId) {
  showScreen("game");
  el.roleBadge.textContent = role;
  el.roleBadge.classList.toggle("x", role === "X");
  el.roleBadge.classList.toggle("o", role === "O");
  el.roomCodeTag.textContent = `Rum: ${roomCode}`;
  el.shareCode.textContent = roomCode;

  enterGame(roomCode, role, playerId, {
    onStatusUpdate(info) {
      el.statusText.textContent = info.text;
      el.sharePanel.classList.toggle("hidden", !info.showSharePanel);
    },
    onIllegalMove(message) {
      showToast(message);
    },
    onGameOver({ winner, youWon, isDraw }) {
      el.gameoverTitle.textContent = isDraw ? "Oavgjort!" : `${winner} vinner!`;
      el.gameoverDesc.textContent = isDraw
        ? "Bra kämpat – ingen vann den här gången."
        : youWon
        ? "Grattis, du vann! 🎉"
        : "Du förlorade denna gång. Försök igen!";
      el.gameoverModal.classList.remove("hidden");
    },
    onGameContinues() {
      el.gameoverModal.classList.add("hidden");
    },
    onRoomMissing() {
      showToast("Rummet finns inte längre.");
      returnToLobby();
    },
  });
}

// --- Spelar-id via anonym Firebase-autentisering --------------------------
let playerId = null;
function requirePlayerId() {
  if (!playerId) throw new Error("Ansluter fortfarande, försök igen om en sekund.");
  return playerId;
}

function init() {
  onAuthStateChanged(auth, (user) => {
    if (!user) return;
    playerId = user.uid;

    const params = new URLSearchParams(location.search);
    const roomFromUrl = params.get("room");
    const saved = getSavedSession();

    if (saved) {
      joinRoom(saved.room, playerId)
        .then((role) => startGame(saved.room, role, playerId))
        .catch(() => {
          clearSavedSession();
          showScreen("lobby");
        });
      return;
    }

    if (roomFromUrl && isValidRoomCode(roomFromUrl)) {
      el.tabBtns.forEach((b) => b.classList.toggle("active", b.dataset.tab === "join"));
      el.tabCreate.classList.add("hidden");
      el.tabJoin.classList.remove("hidden");
      el.joinCodeInput.value = roomFromUrl;
    }

    showScreen("lobby");
  });

  signInAnonymously(auth).catch((err) => {
    showLobbyError(
      "Kunde inte ansluta till Firebase. Kontrollera din firebase-config.js. (" +
        err.message +
        ")"
    );
  });
}

init();
