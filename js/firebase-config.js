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
  apiKey: "DIN_API_KEY",
  authDomain: "DITT_PROJEKT.firebaseapp.com",
  databaseURL: "https://DITT_PROJEKT-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "DITT_PROJEKT",
  storageBucket: "DITT_PROJEKT.appspot.com",
  messagingSenderId: "DITT_SENDER_ID",
  appId: "DIN_APP_ID",
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
