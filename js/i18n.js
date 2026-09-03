// Enkel i18n-modul: ordbok + hjälpfunktioner. Inget ramverk, bara
// data-i18n-attribut i HTML:en som fylls i från ordboken nedan.

const STORAGE_LANG_KEY = "uttt_lang";
const DEFAULT_LANG = "en";

const dict = {
  en: {
    room_code_tag: "Room: {code}",
    app_subtitle: "Play against a friend in real time",
    mode_create_label: "Create room",
    mode_join_label: "Join",
    tab_create_desc: "Create a new room and share the code with your opponent. You'll be X.",
    create_room_btn: "Create room",
    tab_join_desc: "Enter the 4-digit room code. You'll be O.",
    join_room_btn: "Join room",
    rules_link: "How to play? See the rules",

    share_panel_text: "Share the code with your opponent:",
    copy_link_btn: "Copy link",
    rules_btn_title: "Rules",
    leave_btn_title: "Leave room",

    status_waiting: "Waiting for opponent...",
    status_your_turn: "Your turn",
    status_opponent_turn: "Opponent's turn...",
    status_draw: "Draw!",
    status_you_won: "You won!",
    status_you_lost: "You lost",

    toast_not_your_turn: "Not your turn!",
    toast_room_missing: "This room no longer exists.",
    toast_link_copied: "Link copied!",

    gameover_winner: "{symbol} wins!",
    gameover_draw_title: "Draw!",
    gameover_draw_desc: "Good game – nobody won this time.",
    gameover_win_desc: "Congrats, you won! 🎉",
    gameover_lose_desc: "You lost this time. Try again!",
    gameover_restart_btn: "Play again",
    gameover_leave_btn: "Back to lobby",

    rules_title: "Rules",
    rules_close_btn: "Close",
    rules_html: `
      <p>
        Ultimate Tic-Tac-Toe is played on a large 3&times;3 grid where every
        cell is itself a small tic-tac-toe board – 9 small boards with 9
        squares each.
      </p>
      <ol>
        <li>X makes the first move in any small board, any square.</li>
        <li>
          Whichever square you pick <strong>within</strong> the small board
          decides which of the 9 large boards your opponent must play in
          next. Play the top-right square, for example, and your opponent
          is sent to the top-right board.
        </li>
        <li>
          If that board is already won or full, the player instead gets a
          free choice among all open boards – a "wildcard".
        </li>
        <li>
          Get three of your own symbols in a row (horizontally, vertically,
          or diagonally) in a small board and you win it – it gets marked
          with your large symbol.
        </li>
        <li>
          If a small board fills up with no winner, it counts as a draw and
          doesn't count for either player.
        </li>
        <li>
          The first player to win three boards in a row on the large grid
          wins the whole game. If every board is decided and nobody got
          three in a row, the match is a draw.
        </li>
      </ol>
    `,

    error_no_free_code: "Couldn't find a free room code right now. Please try again.",
    error_room_not_found: "This room doesn't exist. Check the code.",
    error_room_full: "This room is full.",
    error_room_full_race: "This room filled up just before you joined.",
    error_invalid_code: "Enter a valid 4-digit room code.",
    error_connecting: "Still connecting, please try again in a second.",
    error_generic: "Something went wrong. Please try again.",
    error_firebase_config: "Couldn't connect to Firebase. Check your firebase-config.js. ({message})",
  },
  sv: {
    room_code_tag: "Rum: {code}",
    app_subtitle: "Spela mot en vän i realtid",
    mode_create_label: "Skapa rum",
    mode_join_label: "Gå med",
    tab_create_desc: "Skapa ett nytt rum och dela koden med din motståndare. Du blir X.",
    create_room_btn: "Skapa rum",
    tab_join_desc: "Ange den 4-siffriga rumskoden. Du blir O.",
    join_room_btn: "Gå med i rum",
    rules_link: "Hur spelar man? Se spelreglerna",

    share_panel_text: "Dela koden med din motståndare:",
    copy_link_btn: "Kopiera länk",
    rules_btn_title: "Spelregler",
    leave_btn_title: "Lämna rum",

    status_waiting: "Väntar på motståndare...",
    status_your_turn: "Din tur",
    status_opponent_turn: "Motståndarens tur...",
    status_draw: "Oavgjort!",
    status_you_won: "Du vann!",
    status_you_lost: "Du förlorade",

    toast_not_your_turn: "Inte din tur!",
    toast_room_missing: "Rummet finns inte längre.",
    toast_link_copied: "Länk kopierad!",

    gameover_winner: "{symbol} vinner!",
    gameover_draw_title: "Oavgjort!",
    gameover_draw_desc: "Bra kämpat – ingen vann den här gången.",
    gameover_win_desc: "Grattis, du vann! 🎉",
    gameover_lose_desc: "Du förlorade denna gång. Försök igen!",
    gameover_restart_btn: "Spela igen",
    gameover_leave_btn: "Tillbaka till lobbyn",

    rules_title: "Spelregler",
    rules_close_btn: "Stäng",
    rules_html: `
      <p>
        Ultimate Tic-Tac-Toe spelas på ett stort 3&times;3-rutnät där varje
        ruta i sig är ett eget litet tre-i-rad-bräde – totalt 9 småbräden
        med 9 rutor vardera.
      </p>
      <ol>
        <li>X gör första draget i valfritt litet bräde och valfri ruta.</li>
        <li>
          Vilken ruta du väljer <strong>inom</strong> det lilla brädet
          avgör vilket av de 9 stora brädena motståndaren måste spela i
          härnäst. Spelar du t.ex. i övre högra rutan skickas
          motståndaren till det övre högra brädet.
        </li>
        <li>
          Är det brädet redan vunnet eller fullt får spelaren istället
          välja fritt bland alla öppna bräden – ett "frikort".
        </li>
        <li>
          Får du tre egna symboler i rad (vågrätt, lodrätt eller
          diagonalt) i ett litet bräde vinner du det brädet, och det
          markeras med din stora symbol.
        </li>
        <li>
          Blir ett litet bräde fullt utan vinnare räknas det som
          oavgjort och räknas inte till någon spelare.
        </li>
        <li>
          Först med tre vunna bräden i rad i det stora rutnätet vinner
          hela spelet. Är alla bräden avgjorda utan att någon fått tre i
          rad blir hela matchen oavgjort.
        </li>
      </ol>
    `,

    error_no_free_code: "Kunde inte hitta en ledig rumskod just nu. Försök igen.",
    error_room_not_found: "Rummet finns inte. Kontrollera koden.",
    error_room_full: "Rummet är fullt.",
    error_room_full_race: "Rummet blev fullt precis innan du hann ansluta.",
    error_invalid_code: "Ange en giltig 4-siffrig rumskod.",
    error_connecting: "Ansluter fortfarande, försök igen om en sekund.",
    error_generic: "Något gick fel. Försök igen.",
    error_firebase_config: "Kunde inte ansluta till Firebase. Kontrollera din firebase-config.js. ({message})",
  },
};

let currentLang = localStorage.getItem(STORAGE_LANG_KEY) || DEFAULT_LANG;
if (!dict[currentLang]) currentLang = DEFAULT_LANG;

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  if (!dict[lang]) return;
  currentLang = lang;
  localStorage.setItem(STORAGE_LANG_KEY, lang);
  document.documentElement.lang = lang;
  applyTranslations();
}

// Hämtar en text ur ordboken och ersätter ev. {placeholders}.
export function t(key, vars) {
  const text = dict[currentLang][key] ?? dict[DEFAULT_LANG][key] ?? key;
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (_, name) => (vars[name] ?? ""));
}

// Fyller i alla element med data-i18n(-html/-placeholder/-title/-aria-label)
// -attribut från den aktuella ordboken. Körs vid start och vid språkbyte.
export function applyTranslations(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll("[data-i18n-html]").forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  root.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const text = t(el.dataset.i18nTitle);
    el.title = text;
    el.setAttribute("aria-label", text);
  });
  document.documentElement.lang = currentLang;
}
