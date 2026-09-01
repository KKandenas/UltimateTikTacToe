# Ultimate Tic-Tac-Toe – Multiplayer

En mobilanpassad, realtids-multiplayerversion av Ultimate Tic-Tac-Toe. Byggd med
ren HTML/CSS/JavaScript (inga byggverktyg krävs) och Firebase Realtime Database
för att synka spelbräde, turordning och rum mellan två spelare.

## Filstruktur

```
index.html              Hela appen (lobby + spelvy) i en sida
css/style.css            Mörkt, mobilanpassat UI + animationer
js/firebase-config.js    Din Firebase-konfiguration (fyll i egna värden)
js/gameEngine.js         Ren spellogik (ingen Firebase/DOM-koppling)
js/lobby.js              Skapa/gå med i rum, spara session
js/game.js               Realtidssynk mot Firebase + rendering av brädet
js/main.js               Startpunkt: autentisering, skärmbyten, koppling
```

`gameEngine.js` innehåller all spelregel-logik (vinstkontroll, vilket bräde som
är aktivt, frikort osv.) helt utan beroenden, så samma kod används både när
klienten ritar upp brädet och inuti Firebase-transaktionen som faktiskt
utför draget – vilket garanterar att båda spelarna alltid ser exakt samma
resultat.

## Steg 1 – Skapa ett Firebase-projekt

1. Gå till [console.firebase.google.com](https://console.firebase.google.com)
   och klicka **Lägg till projekt**.
2. Ge projektet ett namn (t.ex. `ultimate-tictactoe`) och slutför guiden
   (Google Analytics behövs inte).

## Steg 2 – Lägg till en webbapp

1. På projektets startsida, klicka på webb-ikonen `</>` för att registrera en
   ny webbapp.
2. Ge appen ett smeknamn (t.ex. "UTTT Web"). Du behöver **inte** kryssa i
   Firebase Hosting nu (kan göras senare, se steg 6).
3. Firebase visar ett `firebaseConfig`-objekt. Kopiera det.

## Steg 3 – Klistra in konfigurationen

Öppna `js/firebase-config.js` och ersätt platshållarvärdena med dina egna:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};
```

## Steg 4 – Aktivera Realtime Database

1. I vänstermenyn: **Build → Realtime Database → Skapa databas**.
2. Välj en region (t.ex. Europe/Belgium eller närmaste region).
3. Starta i **testläge** för att komma igång snabbt – byt sedan till
   reglerna nedan innan du delar appen med andra.
4. Kopiera **databaseURL** (visas högst upp, t.ex.
   `https://ditt-projekt-default-rtdb.europe-west1.firebasedatabase.app`)
   och se till att den stämmer med värdet i `firebase-config.js`.

### Säkerhetsregler

Appen använder anonym autentisering (aktiveras i nästa steg) så att bara
inloggade klienter (dvs. appens egna besökare) kan läsa/skriva. Gå till
**Realtime Database → Regler** och klistra in:

```json
{
  "rules": {
    "rooms": {
      "$roomCode": {
        ".read": "auth != null",
        ".write": "auth != null",
        ".validate": "newData.hasChildren(['status', 'turn', 'activeBoard', 'boards', 'boardWinners', 'winner', 'players'])"
      }
    }
  }
}
```

> **Obs:** Detta skyddar mot obehöriga utanför appen, men eftersom det inte
> finns någon backend-server som validerar varje enskilt drag litar appen på
> klientens `gameEngine.js`-logik (samma kod körs i en Firebase-transaction
> för att undvika kapplöpningar mellan spelarna). Det är fullt tillräckligt
> för ett vänskapligt spel. Vill du härda ytterligare mot fusk kan du flytta
> drag-valideringen till en Cloud Function.

## Steg 5 – Aktivera anonym autentisering

1. **Build → Authentication → Get started**.
2. Under fliken **Sign-in method**, aktivera **Anonymous**.

Detta gör att varje spelare får ett unikt, stabilt ID (utan inloggning) som
används för att avgöra vem som är X respektive O, och för att kunna ladda om
sidan utan att tappa sin plats i spelet.

### Lägg till din domän under Authorized domains

Firebase Auth litar bara på ett par domäner som standard (`localhost`,
`ditt-projekt.firebaseapp.com`, `ditt-projekt.web.app`). Kör du appen från
någon annan adress – t.ex. GitHub Pages – måste du lägga till den domänen
manuellt, annars misslyckas inloggningen med felet
`auth/unauthorized-domain`.

1. Öppna **Authentication** i vänstermenyn (samma sida som i steg ovan).
2. Klicka på fliken **Settings** längst upp på sidan (bredvid "Users",
   "Sign-in method", "Templates", "Usage").
3. Scrolla ner till rubriken **Authorized domains**.
4. Klicka **Add domain** och skriv in domänen **utan** `https://` och
   **utan** avslutande snedstreck, t.ex. `kkandenas.github.io`
   (inte hela sökvägen `.../UltimateTikTacToe/`).

Om du inte hittar sidan: gå direkt till
`https://console.firebase.google.com/project/DITT-PROJEKT-ID/authentication/settings`
(byt ut `DITT-PROJEKT-ID` mot ditt Firebase-projekts ID, som du hittar under
**Project settings** ⚙️ → **General** → **Project ID**).

## Steg 6 – Kör appen

### Alternativ A: Kör lokalt

Filerna använder ES-moduler, vilket kräver att sidan serveras över HTTP (inte
`file://`). Enklast:

```bash
cd UltimateTikTacToe
python3 -m http.server 8000
```

Öppna sedan `http://localhost:8000` i två olika flikar/enheter för att testa.

### Alternativ B: Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # välj ditt projekt, public-mapp = "." (repots rot)
firebase deploy
```

Firebase ger dig en publik `https://ditt-projekt.web.app`-länk som fungerar
perfekt att öppna direkt i mobilens webbläsare.

### Alternativ C: GitHub Pages (auto-deploy vid varje push)

Repot innehåller `.github/workflows/deploy-pages.yml` som bygger och
publicerar sidan automatiskt varje gång du pushar till branchen
`claude/ultimate-tictactoe-multiplayer-qgscce`. Aktivera det så här:

1. Gå till repots **Settings → Pages**.
2. Under **Build and deployment → Source**, välj **GitHub Actions**
   (inte "Deploy from a branch").
3. Pusha en commit – workflowen körs automatiskt under fliken **Actions**
   och sidan publiceras på `https://<ditt-github-användarnamn>.github.io/<repo-namn>/`.

> Om du senare byter till en annan branch (t.ex. `main`) som standard,
> uppdatera `branches:`-listan i workflow-filen så den pekar på rätt branch.

**Glöm inte:** lägg till GitHub Pages-domänen i Firebase Authorized domains
(se steg 5 ovan) – annars misslyckas inloggningen med
`auth/unauthorized-domain` när sidan körs från `github.io`.

## Hur spelet fungerar

- **Skapa rum**: genererar en 4-siffrig kod, skapar `/rooms/<kod>` i databasen
  och gör dig till **X**. Du kan dela koden eller en länk
  (`?room=<kod>`) med din motståndare.
- **Gå med i rum**: ansluter till ett existerande rum via koden och blir
  **O**. En Firebase-transaction ser till att bara en spelare kan bli O även
  om två personer försöker gå med samtidigt.
- **Drag**: skickas som en Firebase Realtime Database-transaction på hela
  rum-objektet, vilket gör draget atomiskt även om båda spelarna råkar
  trycka samtidigt.
- **Aktivt bräde**: markeras med en pulserande ram (grön om det är din tur,
  lila om det är motståndarens). Om spelaren skickas till ett bräde som redan
  är vunnet/fullt blir alla öppna bräden spelbara ("frikort").
- **Återanslutning**: din roll och rumskod sparas i `localStorage`, så en
  omladdning av sidan (t.ex. om mobilen låser skärmen) tar dig tillbaka till
  samma spel.

## Testa spellogiken

`js/gameEngine.js` är fristående och kan köras/testas direkt med Node:

```bash
node --input-type=module -e "
import { computeBoardResult } from './js/gameEngine.js';
console.log(computeBoardResult(['X','X','X','','','','','','']));
"
```
