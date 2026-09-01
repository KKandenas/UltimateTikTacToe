// ============================================================================
// FIREBASE-KONFIGURATION
// ----------------------------------------------------------------------------
// Ersätt värdena nedan med din egen Firebase-konfiguration.
// Du hittar dem i Firebase Console -> Project settings -> Your apps -> SDK setup.
// Se README.md för en fullständig steg-för-steg-guide.
// ============================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBudHKfeE6tXhQf5T2fNL0lSx5yzRWA2yc",
  authDomain: "ultimate-tictactoe-79662.firebaseapp.com",
  projectId: "ultimate-tictactoe-79662",
  storageBucket: "ultimate-tictactoe-79662.firebasestorage.app",
  messagingSenderId: "214529197218",
  appId: "1:214529197218:web:9f5a8c8d154ddad4eac3fb"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
