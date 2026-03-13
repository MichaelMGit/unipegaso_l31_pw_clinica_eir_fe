
# Clinica Eir — Frontend React per gestione clinica integrata

## Abstract

Clinica Eir è una single-page application sviluppata in React per la gestione digitale dei processi amministrativi e clinici di una struttura sanitaria. Il sistema dialoga con un backend FastAPI e implementa autenticazione JWT, controllo accessi basato sui ruoli, orchestrazione del flusso prenotazione-visita-referto, consultazione documentale e monitoraggio statistico. Il progetto costituisce un caso di studio significativo per l'analisi di un'architettura web disaccoppiata in ambito sanitario, in cui usabilità, separazione delle responsabilità e sicurezza applicativa rappresentano elementi centrali.

## Introduzione

Questo repository contiene il frontend della piattaforma **Clinica Eir**, una web application sviluppata in **React** per la gestione dei principali processi operativi di una struttura sanitaria privata: autenticazione, prenotazioni, consultazione visite, referti, relazione clinica, dashboard operative per i diversi ruoli e cruscotto statistico amministrativo.

L'applicazione è progettata per comunicare con un backend sviluppato in **FastAPI**, esposto tramite API REST documentate con specifica **OpenAPI 3.1**. Il frontend implementa una separazione chiara fra:

- livello di presentazione (`pages/`, `components/`);
- livello di stato di autenticazione (`contexts/AuthContext.js`);
- livello di accesso ai servizi applicativi (`src/api/services/`);
- livello di configurazione degli endpoint (`src/api/endpoints.js`).

Dal punto di vista della tesi, il progetto è interessante perché mostra in modo concreto:

- l'integrazione fra **SPA React** e backend **FastAPI**;
- un modello **RBAC** (Role-Based Access Control) con 4 ruoli applicativi principali;
- la gestione di **JWT access token + refresh token**;
- la costruzione di flussi eterogenei per utenti autenticati e utenti guest;
- un uso coordinato di componenti UI, grafici, calendario, upload file e rendering di contenuti clinici.

---

## Obiettivo funzionale dell'applicazione

L'applicazione ha come obiettivo la digitalizzazione del ciclo di vita della visita medica, dalla prenotazione iniziale fino alla produzione e consultazione del referto.

In particolare, il sistema consente di:

- autenticare utenti con ruoli differenti;
- indirizzare ogni utente verso una dashboard coerente con il proprio profilo;
- prenotare visite mediche in base a specialità, medico, data e slot disponibili;
- consultare le prenotazioni future e lo storico delle visite;
- compilare una relazione clinica in formato ricco;
- caricare referti con allegati scaricabili;
- consentire al paziente o a un utente guest autorizzato la consultazione dei documenti clinici;
- offrire all'amministrazione indicatori statistici e KPI sull'andamento della clinica.

---

## Stack tecnologico

Dall'analisi di `package.json`, il frontend è costruito con il seguente stack:

### Librerie principali

- **React 19**
- **React Router DOM 6** per il routing client-side
- **Material UI (MUI)** per l'interfaccia grafica
- **Axios** per le chiamate HTTP ai servizi REST
- **FullCalendar** per il calendario appuntamenti
- **Chart.js** + `react-chartjs-2` per dashboard e grafici statistici
- **React Quill** per l'editing rich text della relazione clinica e del testo referto
- **SweetAlert2** per feedback utente e modali
- **qrcode.react** per funzionalità QR

### Tooling

- **Create React App** come base di bootstrap
- **react-scripts** per dev server, test e build

### Configurazione runtime

Nel file `.env` è presente:

```properties
REACT_APP_API_URL=http://localhost:8000
```

Nel file `package.json` è inoltre presente:

```json
"proxy": "http://127.0.0.1:8000"
```

Questo indica che, in sviluppo, il frontend è predisposto a comunicare con il backend FastAPI locale sia tramite proxy CRA sia tramite base URL esplicita.

---

## Architettura generale del frontend

La struttura del progetto segue una suddivisione abbastanza pulita per responsabilità.

### Architettura a livelli

Il frontend può essere letto secondo una scomposizione a livelli:

- **Presentation layer**: pagine e componenti React che costruiscono interfaccia e navigazione;
- **Application layer**: contesto di autenticazione, regole di accesso, orchestrazione dei flussi;
- **Integration layer**: servizi API e client Axios;
- **Contract layer**: mappatura centralizzata degli endpoint e allineamento al contratto OpenAPI.

Questa lettura è utile in tesi perché rende evidente il principio di separazione delle responsabilità tra logica di presentazione, logica applicativa e integrazione con i servizi remoti.

### `src/App.js`

È il punto di orchestrazione del routing. Qui vengono:

- montati `AuthProvider` e `Navbar`;
- dichiarate le rotte pubbliche e protette;
- applicate le restrizioni per ruolo tramite `ProtectedRoute`;
- gestite anche le rotte guest.

### `src/contexts/AuthContext.js`

È il cuore della gestione della sessione. Mantiene:

- utente autenticato;
- stato di loading iniziale;
- login/logout;
- refresh automatico del token;
- aggiornamento dati utente (`refreshUser`).

### `src/api/client.js`

Contiene un'istanza Axios centralizzata con:

- injection dell'`Authorization: Bearer <token>` su ogni richiesta autenticata;
- intercettazione delle risposte `401`;
- tentativo automatico di refresh;
- retry della richiesta originale dopo il rinnovo del token.

### `src/api/endpoints.js`

Mappa centralmente tutti gli endpoint del backend, suddivisi per risorsa:

- `auth`
- `specialita`
- `medici`
- `pazienti`
- `prenotazioni`
- `visite`
- `prestazioni`
- `referti`
- `statistiche`
- `health`
- `metrics`

### `src/api/services/`

Ogni file incapsula un gruppo di operazioni applicative, evitando che i componenti UI conoscano i dettagli del trasporto HTTP.

Questa scelta è molto utile in una tesi, perché mostra una forma di **service layer frontend** che migliora manutenibilità e riuso.

---

## Modello dei ruoli applicativi

In `src/constants/userRoles.js` i ruoli sono centralizzati come costanti:

- `medico`
- `paziente`
- `segreteria`
- `amministratore`
- `guest`

L'app usa un modello **RBAC** semplice ma efficace.

### Mappatura dei ruoli alle dashboard

- paziente → `/paziente/dashboard`
- medico → `/medico/dashboard`
- segreteria → `/segreteria/dashboard`
- amministratore → `/amministratore/dashboard`

Questo comportamento è incapsulato nella funzione `getDashboardRoute(ruolo)`.

---

## Routing e controllo accessi

Il routing è completamente lato client tramite `react-router-dom`.

### Rotte pubbliche

- `/login`
- `/registrazione`
- `/accesso-guest`
- `/visita-guest/:id`

Le prime due sono accessibili solo ai non autenticati grazie a `PublicRoute`.

### Rotte protette

Le aree riservate sono protette da `ProtectedRoute`, che:

1. attende il completamento del bootstrap auth (`loading`);
2. reindirizza al login se non esiste un utente autenticato;
3. verifica che il ruolo dell'utente sia incluso tra quelli consentiti;
4. in caso di ruolo non coerente, reindirizza alla dashboard corretta per quel ruolo.

Questo evita sia l'accesso anonimo, sia l'accesso a sezioni incompatibili con il ruolo assegnato.

---

## Gestione autenticazione e sessione

Uno dei punti più interessanti del progetto è la gestione della sessione autenticata.

### Flusso di login

Il backend FastAPI espone `/api/auth/login` con standard OAuth2 password flow. Il frontend invia le credenziali come `application/x-www-form-urlencoded`, coerentemente con `OAuth2PasswordRequestForm`.

Snippet significativo da `src/api/services/auth.js`:

```javascript
const login = (email, password) => {
	const formData = new URLSearchParams();
	formData.append('username', email);
	formData.append('password', password);

	return client.post(endpoints.auth.login, formData, {
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	});
};
```

Questo dettaglio è importante perché mostra un frontend allineato correttamente alle convenzioni di FastAPI per l'autenticazione OAuth2.

### Persistenza della sessione

La sessione viene mantenuta tramite:

- `access_token` in `localStorage`
- `refresh_token` in `localStorage`

All'avvio dell'app, `AuthContext` prova a ricostruire la sessione chiamando `/api/auth/me`.

### Refresh proattivo del token

Un aspetto notevole è la presenza di una strategia di refresh proattivo:

- il token JWT viene decodificato lato client;
- viene letto il campo `exp`;
- il refresh viene schedulato 60 secondi prima della scadenza;
- in caso di errore, la sessione viene invalidata.

Snippet significativo da `src/contexts/AuthContext.js`:

```javascript
const payload = JSON.parse(atob(parts[1]));
const exp = payload.exp;
const now = Math.floor(Date.now() / 1000);
const msUntilRefresh = (exp - now - 60) * 1000;
```

Questa scelta migliora l'esperienza utente perché riduce la probabilità che una richiesta cada precisamente dopo la scadenza del token.

### Refresh reattivo via interceptor

Parallelamente, `src/api/client.js` implementa un secondo livello di robustezza:

- se una richiesta riceve `401 Unauthorized`;
- il client prova a usare il `refresh_token`;
- aggiorna i token;
- ripete la richiesta originale.

Si tratta di una strategia ben progettata, che unisce:

- **refresh schedulato** (proattivo),
- **refresh on-demand** (reattivo).

---

## Comunicazione con il backend FastAPI

Dal file `openapi.json` aggiornato si ricava che il backend espone un insieme ricco di endpoint REST, con descrizioni più dettagliate sui casi d'uso e sulle regole di accesso.

### Aree funzionali principali del backend consumato dal frontend

#### Autenticazione

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PATCH /api/auth/me`
- `POST /api/auth/registrazione`

#### Dominio clinico e organizzativo

- `GET/POST /api/specialita`
- `GET/PATCH/DELETE /api/specialita/{specialita_id}`
- `GET /api/specialita/{specialita_id}/prestazioni`
- `GET/POST /api/medici`
- `GET/PATCH/DELETE /api/medici/{medico_id}`
- `GET /api/medici/{medico_id}/slot`
- `GET /api/pazienti`
- `GET/PATCH /api/pazienti/{paziente_id}`
- `GET /api/pazienti/{paziente_id}/referti`
- `GET/POST /api/prenotazioni`
- `GET/DELETE /api/prenotazioni/{prenotazione_id}`
- `PATCH /api/prenotazioni/{prenotazione_id}/status`
- `PATCH /api/prenotazioni/{prenotazione_id}/pagamento`
- `POST /api/prenotazioni/{prenotazione_id}/reschedule`
- `POST /api/prenotazioni/{prenotazione_id}/resend-guest-token`
- `PATCH /api/prenotazioni/{prenotazione_id}/guest`
- `GET /api/visite`
- `GET /api/visite/{visita_id}`
- `PATCH /api/visite/{visita_id}/relazione`
- `GET /api/visite/{visita_id}/relazione/print`
- `POST/GET /api/visite/{visita_id}/referti`
- `POST /api/visite/guest`
- `GET /api/referti/{referto_id}`
- `POST /api/referti/{referto_id}/attachments`
- `GET /api/referti/{referto_id}/download`
- `GET/POST /api/prestazioni`
- `GET/PATCH/DELETE /api/prestazioni/{prestazione_id}`

#### Monitoraggio e analytics

- `GET /api/health`
- `GET /api/metrics`
- `GET /api/statistiche/overview`
- `GET /api/statistiche/prenotazioni/trend`
- `GET /api/statistiche/prestazioni/revenue`
- `GET /api/statistiche/top-specialita`
- `GET /api/statistiche/medici/avg-pren-per-medico`
- `GET /api/statistiche/revenue/by-specialita`
- `POST /api/statistiche/cache/clear`

---

## Metodo di analisi adottato

Per redigere questa documentazione in modo accurato è stata seguita una metodologia di analisi su tre livelli:

1. **analisi statica del frontend**: lettura dei componenti, delle pagine, del routing e del context di autenticazione;
2. **analisi del service layer**: verifica delle chiamate HTTP, dei payload e dei flussi di integrazione verso FastAPI;
3. **analisi del contratto OpenAPI**: ricostruzione delle risorse backend, degli schemi dati, dei vincoli di ruolo e dei casi d'uso esposti.

Questa impostazione permette di documentare il comportamento applicativo con un buon grado di precisione anche in assenza del codice backend completo.

---

## Funzionalità per ruolo

## Area paziente

L'area paziente è composta principalmente dalle seguenti pagine:

- `PazienteDashboard`
- `NuovaPrenotazione`
- `StoricoPrenotazioni`
- `PazienteReferti`
- `PazienteProfilo`
- `PazienteVisita`

### Dashboard paziente

La dashboard mostra:

- un riepilogo della prossima prenotazione;
- accessi rapidi alla nuova prenotazione;
- accesso allo storico;
- accesso ai referti.

Per comporre il riepilogo iniziale, il frontend interroga in parallelo:

- prenotazioni future;
- elenco medici;
- elenco specialità.

Questo permette di arricchire la prenotazione con metadati leggibili lato UI.

### Nuova prenotazione

La pagina `src/pages/paziente/NuovaPrenotazione.js` implementa un flusso guidato:

1. caricamento delle specialità;
2. selezione della specialità;
3. caricamento dei medici filtrati per specialità;
4. caricamento delle prestazioni collegate;
5. selezione data;
6. interrogazione dinamica degli slot disponibili del medico;
7. invio della prenotazione al backend.

Si tratta di una sequenza molto significativa dal punto di vista progettuale, perché dimostra un frontend **data-driven**, dove il contenuto del form dipende in cascata dalle scelte precedenti.

Snippet significativo:

```javascript
const resp = await mediciService.getSlots(medicoIdForSlots, dataForSlots);
setSlots(Array.isArray(resp.data) ? resp.data : []);
```

Questa riga evidenzia come il frontend non usi orari statici ma interroghi la disponibilità reale lato backend.

### Referti del paziente

La pagina `PazienteReferti` mostra una tabella con:

- data visita;
- titolo del referto;
- medico associato;
- azione di apertura visita;
- download del file.

È presente anche gestione della paginazione server-side mediante `page` e `page_size`.

---

## Area medico

L'area medico ruota attorno a:

- `MedicoDashboard`
- `MedicoVisita`
- `pages/medico/Paziente.js`

### Dashboard medico

Mostra:

- prossime visite confermate;
- ricerca paziente;
- calendario appuntamenti personale.

L'approccio è operativo: il medico vede subito i prossimi appuntamenti e può aprire direttamente la visita.

### Gestione della visita

La pagina `MedicoVisita` è una delle più ricche del progetto. Consente di:

- visualizzare i dati della prenotazione;
- aggiornare lo stato della prenotazione;
- visualizzare i referti già associati al paziente;
- compilare o aggiornare la relazione clinica con editor WYSIWYG;
- generare il PDF della relazione clinica;
- creare un nuovo referto;
- caricare un allegato associato al referto.

Da un punto di vista accademico, questa pagina incarna molto bene il concetto di **postazione digitale del medico**.

Snippet significativo:

```javascript
await visiteService.updateRelazione(visitaId, { relazione_clinica: relazioneClinica });
```

ed esempio di stampa:

```javascript
const res = await visiteService.printRelazione(visitaId);
const blob = res.data || res;
const url = window.URL.createObjectURL(blob);
window.open(url, '_blank');
```

---

## Area segreteria

L'area segreteria è orientata alla gestione trasversale del flusso prenotazioni/pazienti.

Le funzionalità principali includono:

- visione aggregata del calendario appuntamenti;
- filtro per medico;
- filtro per paziente;
- ricerca paziente;
- apertura scheda paziente;
- creazione di nuove prenotazioni;
- supporto operativo su prenotazioni guest e stato pagamenti.

Questa area può essere vista come la console operativa del personale amministrativo di front office.

---

## Area amministratore

La pagina `AmministratoreDashboard` realizza un vero e proprio cruscotto di business intelligence semplificato.

### KPI mostrati

Fra gli indicatori caricati via `statisticsService.overview()`:

- utenti totali;
- utenti guest;
- breakdown utenti per ruolo;
- prenotazioni totali;
- breakdown prenotazioni per stato;
- nuovi utenti nell'ultimo mese;
- nuove prenotazioni ultimi 30 giorni;
- prenotazioni completate ultimi 30 giorni;
- numero totale referti;
- numero totale visite;
- numero totale medici;
- ricavi ultimi 30 giorni;
- ricavi non incassati ultimi 30 giorni.

### Grafici e viste aggregate

- trend prenotazioni per giorno;
- top specialità per volume prenotazioni;
- ricavi per specialità;
- media prenotazioni per medico;
- possibilità di invalidare la cache statistica lato backend.

Questo modulo è particolarmente rilevante in una tesi perché mostra come un frontend clinico non sia limitato alle operazioni transazionali, ma includa anche strumenti di supporto decisionale.

---

## Flusso guest tramite token e codice fiscale

Una funzionalità originale del sistema è il flusso **guest**, destinato a chi deve accedere a una visita o a un referto senza autenticazione tradizionale.

### Passaggi del flusso

1. l'utente apre un link contenente un `token`;
2. la pagina `AccessoGuest` richiede anche il codice fiscale;
3. il frontend invia `token + codice_fiscale` a `POST /api/visite/guest`;
4. il backend restituisce i dati della visita e i referti disponibili;
5. il frontend memorizza i dati necessari in `localStorage`;
6. l'utente viene indirizzato a `/visita-guest/:id`.

### Significato architetturale

Questo flusso dimostra la gestione di un accesso eccezionale ma controllato, utile in contesti reali come:

- consegna referti via link dedicato;
- accesso rapido da QR code;
- condivisione sicura di documenti sanitari senza account persistente.

È una soluzione interessante, anche se in una discussione di tesi conviene sottolineare che l'uso di `localStorage` per dati sensibili guest non è la soluzione più forte possibile in ottica security-hardening.

---

## Requisiti funzionali

Dal comportamento del frontend e dalla specifica `openapi.json` emergono i seguenti requisiti funzionali principali.

### Autenticazione e profilo

- registrazione di un nuovo paziente;
- login con credenziali email/password;
- refresh della sessione;
- logout con revoca del refresh token;
- visualizzazione e aggiornamento del proprio profilo.

### Gestione utenti e attori clinici

- consultazione delle informazioni anagrafiche dei pazienti;
- ricerca e consultazione dei medici;
- creazione e aggiornamento dei medici da parte di segreteria/admin;
- creazione, modifica e cancellazione di specialità e prestazioni da parte dei ruoli autorizzati.

### Prenotazioni

- creazione di una nuova prenotazione;
- ricerca e filtro delle prenotazioni per stato, data, medico e paziente;
- modifica dello stato della prenotazione;
- ripianificazione di una prenotazione esistente;
- aggiornamento dello stato pagamento;
- associazione di una prenotazione guest a un paziente registrato;
- rigenerazione del token guest per una prenotazione.

### Visite e referti

- consultazione della visita;
- aggiornamento della relazione clinica;
- generazione del PDF della relazione;
- creazione di referti per una visita;
- upload degli allegati al referto;
- download del referto per utenti autenticati o guest autorizzati.

### Reporting e monitoraggio

- visualizzazione di KPI aggregati lato amministrazione;
- analisi trend prenotazioni;
- analisi ricavi per prestazione e per specialità;
- visualizzazione della media prenotazioni per medico;
- reset della cache statistica lato backend.

---

## Attori e casi d'uso principali

### Attori del sistema

- **Paziente**
- **Medico**
- **Segreteria**
- **Amministratore**
- **Guest**

### Sintesi dei casi d'uso

| Attore | Casi d'uso principali |
|---|---|
| Paziente | Registrarsi, autenticarsi, prenotare una visita, consultare storico e referti, aggiornare il proprio profilo |
| Medico | Visualizzare agenda, aprire visite, scrivere relazione clinica, creare referti, caricare allegati |
| Segreteria | Cercare pazienti, gestire prenotazioni, monitorare il calendario, supportare i flussi guest, aggiornare dati amministrativi |
| Amministratore | Analizzare KPI e statistiche aggregate, ottenere visione complessiva del sistema |
| Guest | Accedere a visita e documentazione tramite token dedicato e codice fiscale |

---

## Requisiti non funzionali

Accanto ai requisiti funzionali, il progetto suggerisce anche diversi requisiti non funzionali.

### Usabilità

- interfaccia web moderna e responsiva;
- navigazione per ruolo con dashboard dedicate;
- feedback visuali su caricamento, errore e successo;
- formulari guidati con validazione lato client.

### Sicurezza

- autenticazione con JWT;
- controllo accessi per ruolo;
- protezione delle rotte lato frontend;
- refresh token per continuità di sessione;
- flusso guest vincolato a token + codice fiscale.

### Manutenibilità

- service layer dedicato;
- endpoint centralizzati;
- separazione tra componenti, pagine, servizi e contesto globale;
- struttura leggibile e facilmente estendibile.

### Scalabilità logica

- presenza di endpoint paginati per collezioni significative;
- uso di filtri query e payload coerenti con un sistema informativo estendibile;
- possibilità di evoluzione indipendente del backend grazie a un contratto API esplicito.

---

## Componenti riusabili di particolare interesse

## `CalendarAppointments`

È uno dei componenti più significativi dell'intero progetto.

Funzioni principali:

- visualizzazione mensile degli appuntamenti con `FullCalendar`;
- fetch dinamico delle prenotazioni del mese corrente;
- filtro opzionale per medico;
- filtro opzionale per paziente;
- navigazione mese/anno;
- apertura della visita dal calendario.

Dal punto di vista tecnico, è apprezzabile la presenza di:

- cache semplice dell'ultimo mese caricato;
- prevenzione di richieste duplicate in-flight;
- ricostruzione degli eventi da dati backend.

Snippet significativo:

```javascript
const monthKey = `${medicoId || 'all'}-${visibleDate.getFullYear()}-${visibleDate.getMonth()}`;
if (lastFetchedMonthRef.current === monthKey) return;
if (inFlightFetches.current.has(monthKey)) return;
```

## `PatientSearch`

Implementa una ricerca pazienti con debounce e apertura rapida del dettaglio.

È riusato in area medico e segreteria, mostrando un buon livello di riusabilità del codice.

## `RefertoItem` + `RefertoDownload`

Separano la logica di presentazione del referto da quella di download, favorendo modularità.

---

## Scelte progettuali rilevanti

### 1. Centralizzazione degli endpoint

La presenza di `src/api/endpoints.js` evita stringhe hardcoded disperse nel codice.

### 2. Service layer dedicato

I componenti non chiamano direttamente Axios, ma usano servizi come:

- `authService`
- `prenotazioniService`
- `visiteService`
- `statisticsService`

### 3. RBAC lato routing

Il controllo di accesso non è relegato solo al backend: il frontend filtra e instrada correttamente gli utenti.

### 4. UI moderna e responsive

Material UI consente una presentazione professionale, adatta a un gestionale sanitario.

### 5. Ricorso a rich text editor

L'uso di `ReactQuill` per relazione clinica e testo referto rende il sistema più aderente a un contesto medico reale.

### 6. Contratto API-first

L'aggiornamento del contratto OpenAPI rende ancora più evidente l'approccio **contract-driven**, utile per documentazione, testing d'integrazione ed evoluzione coordinata del sistema.

---

## Schema logico del dominio

Anche senza accesso diretto al database, il contratto OpenAPI consente di ricostruire uno schema logico molto plausibile del dominio applicativo.

### Entità principali

- **Utente**
- **Medico**
- **Paziente**
- **Specialità**
- **Prestazione**
- **Prenotazione**
- **Visita**
- **Referto**
- **Attachment del referto**

### Relazioni principali

$$
	ext{Specialità} \; 1 \to N \; \text{Medici}
$$

$$
	ext{Specialità} \; 1 \to N \; \text{Prestazioni}
$$

$$
	ext{Paziente} \; 1 \to N \; \text{Prenotazioni}
$$

$$
	ext{Medico} \; 1 \to N \; \text{Prenotazioni}
$$

$$
	ext{Prenotazione} \; 0..1 \to 1 \; \text{Visita}
$$

$$
	ext{Visita} \; 1 \to N \; \text{Referti}
$$

$$
	ext{Referto} \; 1 \to N \; \text{Allegati}
$$

### Interpretazione applicativa

Il sistema ruota attorno alla **prenotazione** come evento organizzativo e alla **visita** come evento clinico. Il referto rappresenta il prodotto documentale della visita, mentre allegati e relazione clinica costituiscono la dimensione informativa clinica vera e propria.

---

## Modello dati inferibile dal contratto API

Non è stato possibile interrogare direttamente il database MySQL perché, nel workspace frontend, non sono presenti credenziali o parametri di connessione al database. I file `.env` e `.env.example` espongono solo la variabile `REACT_APP_API_URL`, cioè il puntamento al backend FastAPI. Tuttavia, dalla specifica OpenAPI si ricavano chiaramente le principali entità di dominio.

### Entità principali

#### Utente (`UserOut`)

- `id`
- `nome`
- `cognome`
- `email`
- `ruolo`
- `codice_fiscale`
- `telefono`
- `is_guest`

#### Medico (`MedicoOut`)

- `id`
- `nome`
- `cognome`
- `specialita_id`

#### Specialità (`SpecialitaOut`)

- `id`
- `nome`

#### Prestazione (`PrestazioneRichiestaOut`)

- `id`
- `specialita_id`
- `nome`
- `descrizione`
- `prezzo`

#### Prenotazione (`PrenotazioneOut`)

- `id`
- `visita_id`
- `paziente`
- `specialita`
- `medico`
- `data_visita`
- `orario_inizio`
- `stato`
- `pagato`
- `prestazione_richiesta`

#### Visita (`VisitaOut`)

- `id`
- `prenotazione_id`
- `relazione_clinica`
- `prenotazione`

#### Referto (`RefertoOut`)

- `referto_id`
- `visita_id`
- `prenotazione_id`
- `data_visita`
- `medico`
- `paziente`
- `titolo`
- `testo_referto`
- `formato`

#### Statistiche (`StatsOverviewOut` e schemi correlati)

Il nuovo `openapi.json` descrive in modo più preciso anche gli output analitici amministrativi:

- overview generale con breakdown utenti e prenotazioni;
- revenue aggregata;
- trend temporali prenotazioni;
- top specialità;
- media prenotazioni per medico;
- revenue per specialità;
- conteggio elementi rimossi dalla cache statistica.

---

## Sicurezza, privacy e controllo degli accessi

Dal contratto OpenAPI aggiornato emerge con maggiore chiarezza la politica di autorizzazione del sistema.

### Esempi significativi

- i pazienti vedono solo i propri dati e i propri referti;
- i medici vedono solo le visite e le prenotazioni di propria competenza;
- la segreteria ha capacità operative estese, ma su alcuni endpoint il contenuto clinico viene oscurato;
- l'amministratore accede a funzioni gestionali e statistiche globali.

Un dettaglio particolarmente interessante per la tesi è il fatto che alcuni endpoint differenziano non solo l'accesso, ma anche il **livello di dettaglio dei dati restituiti**.

Per esempio:

- su `/api/pazienti/{paziente_id}/referti`, il testo clinico può essere oscurato alla segreteria;
- su `/api/referti/{referto_id}`, segreteria e admin possono avere accesso ai metadati ma non necessariamente al contenuto testuale integrale.

Questa distinzione è progettualmente importante perché introduce un controllo accessi **a livello di contenuto**, non solo a livello di route o risorsa.

### Considerazioni GDPR e dati sanitari

In un contesto reale, il progetto dovrebbe essere discusso anche in relazione a:

- minimizzazione dei dati esposti al frontend;
- logging controllato degli accessi ai documenti clinici;
- protezione di token e sessioni;
- tracciabilità delle operazioni sensibili, come download referti e modifica relazioni cliniche.

---

## Informazioni utili per presentazione di tesi

Se devi descrivere il progetto in modo sintetico ma rigoroso, puoi presentarlo così:

> Clinica Eir è una single-page application React che funge da interfaccia operativa per un ecosistema clinico basato su backend FastAPI. Il sistema adotta controllo accessi per ruoli, autenticazione JWT con refresh automatico, gestione completa del flusso di prenotazione-visita-referto e una dashboard amministrativa con KPI e grafici statistici. L'applicazione integra componenti di calendario, ricerca, editor rich text e download documentale, configurandosi come un esempio concreto di frontend gestionale sanitario moderno.

Una possibile formulazione più accademica è la seguente:

> Il progetto Clinica Eir si configura come un sistema informativo sanitario web-oriented, realizzato secondo un'architettura frontend-backend disaccoppiata. Il frontend, sviluppato in React, implementa una single-page application multi-ruolo capace di orchestrare processi amministrativi, clinici e documentali attraverso la consumazione di servizi REST esposti da un backend FastAPI. L'adozione di JWT, RBAC, service layer applicativo, editor clinico rich text e dashboard statistiche rende il progetto un caso di studio significativo per l'analisi della progettazione di interfacce gestionali in ambito sanitario.

---

## Requisiti sintetizzati per capitolo di tesi

### Capitolo requisiti

- gestione multi-utente;
- supporto ai ruoli operativi della clinica;
- prenotazione visite e consultazione referti;
- produzione documentazione clinica;
- monitoraggio amministrativo e statistico.

### Capitolo progettazione

- architettura SPA + API REST;
- routing e protezione delle pagine;
- service layer frontend;
- modellazione del dominio prenotazione-visita-referto;
- integrazione documentale (PDF, allegati).

### Capitolo implementazione

- React + Material UI;
- Axios + interceptor;
- React Router;
- FullCalendar;
- Chart.js;
- React Quill.

### Capitolo valutazione critica

- punti di forza architetturali;
- limiti nell'attuale strategy di storage token;
- opportunità di miglioramento in termini di tipi, test, accessibilità e auditing.

---

## Estratti di codice particolarmente rappresentativi

### 1. Protezione delle rotte per ruolo

File: `src/components/ProtectedRoute.js`

```javascript
if (!user) {
	return <Navigate to="/login" replace />;
}

if (allowedRoles && !allowedRoles.includes(user.ruolo)) {
	return <Navigate to={getDashboardRoute(user.ruolo)} replace />;
}
```

### 2. Refresh automatico della sessione

File: `src/api/client.js`

```javascript
if (
	error.response?.status === 401 &&
	!originalRequest._retry &&
	originalRequest.url !== endpoints.auth.login &&
	originalRequest.url !== endpoints.auth.refresh
) {
	originalRequest._retry = true;
	const refreshToken = localStorage.getItem('refresh_token');
```

### 3. Prenotazione guidata con slot dinamici

File: `src/pages/paziente/NuovaPrenotazione.js`

```javascript
const resp = await mediciService.getSlots(medicoIdForSlots, dataForSlots);
setSlots(Array.isArray(resp.data) ? resp.data : []);
```

### 4. Produzione della relazione clinica

File: `src/pages/medico/MedicoVisita.js`

```javascript
await visiteService.updateRelazione(visitaId, { relazione_clinica: relazioneClinica });
```

### 5. Dashboard amministrativa con analytics

File: `src/pages/amministratore/AmministratoreDashboard.js`

```javascript
const res = await statisticsService.overview();
setOverview(res.data || res);
```

---

## Possibili miglioramenti progettuali da citare in tesi

### Sicurezza

- attualmente i token sono conservati in `localStorage`;
- una soluzione più sicura sarebbe usare **refresh token in cookie HttpOnly**;
- anche i dati guest potrebbero essere gestiti con sessione più temporanea o storage meno esposto.

### Tipizzazione

- il progetto è in JavaScript puro;
- un'evoluzione naturale sarebbe la migrazione a **TypeScript**.

### Testing

- il repository contiene la struttura standard di test CRA, ma non emerge ancora una copertura significativa delle funzionalità core;
- sarebbe utile aggiungere unit test e integration test sui flussi critici.

### Accessibilità e privacy

- sarebbe utile formalizzare un audit di accessibilità;
- per un contesto sanitario reale, andrebbero esplicitati meglio i vincoli GDPR e la protezione dei dati sensibili.

### Audit e osservabilità

- sarebbe utile tracciare chi ha visualizzato o scaricato i referti;
- un audit trail clinico/amministrativo migliorerebbe accountability e conformità;
- si potrebbe integrare logging strutturato e correlazione delle richieste.

### Evoluzione architetturale

- si potrebbe introdurre caching frontend più consapevole;
- si potrebbe costruire un design system condiviso;
- si potrebbe distinguere ancora meglio la parte transazionale da quella analytics.

---

## Sviluppi futuri consigliati

1. migrazione graduale a **TypeScript**;
2. introduzione di **test automatici** sui flussi critici;
3. sostituzione della persistenza token con **cookie HttpOnly** lato backend;
4. tracciamento audit delle azioni sensibili;
5. notifiche automatiche per promemoria visita e disponibilità referto;
6. dashboard statistiche con filtri più avanzati e confronto periodale;
7. documentazione formale del modello dati con ER diagram reale derivato da MySQL.

---

## Avvio del progetto

### Requisiti

- Node.js installato
- backend FastAPI attivo su `http://127.0.0.1:8000` o `http://localhost:8000`

### Installazione dipendenze

```powershell
npm install
```

### Avvio in sviluppo

```powershell
npm start
```

### Build di produzione

```powershell
npm run build
```

---

## Limiti dell'analisi corrente

Questa documentazione è stata redatta analizzando:

- il codice sorgente del frontend;
- la struttura del progetto;
- il contratto `openapi.json` del backend FastAPI.

Non è stato invece possibile analizzare direttamente lo schema MySQL, perché nel repository frontend non sono presenti parametri di connessione al database e lo strumento di accesso richiede credenziali esplicite.

Se verranno forniti i parametri di connessione, si potrà integrare il README con:

- elenco reale delle tabelle;
- chiavi primarie e chiavi esterne;
- corrispondenza fra schema SQL e modelli API;
- osservazioni di coerenza tra persistenza, dominio e frontend;
- diagramma ER reale del sistema.

---

## Conclusione

Il frontend di Clinica Eir rappresenta un progetto ben strutturato, con un perimetro funzionale ampio e coerente con un caso d'uso sanitario reale. L'applicazione non si limita alla semplice visualizzazione di dati, ma implementa un flusso completo che copre autenticazione, operatività clinica, consultazione documentale, accesso guest e analytics amministrative.

Per una tesi universitaria, il progetto offre numerosi spunti di analisi:

- progettazione di SPA con React;
- integrazione frontend/backend via REST;
- gestione della sicurezza applicativa;
- organizzazione per ruoli;
- modellazione del dominio prenotazione-visita-referto;
- costruzione di interfacce operative per contesti professionali.

In sintesi, si tratta di un caso di studio concreto e credibile di **piattaforma web gestionale sanitaria full stack**, in cui il frontend svolge un ruolo attivo nella qualità dell'esperienza utente, nella mediazione dei processi clinici e nella valorizzazione dei dati prodotti dal backend.

## Comunicazione con il backend FastAPI

Dal file `openapi.json` si ricava che il backend espone un insieme ricco di endpoint REST.

### Aree funzionali principali del backend consumato dal frontend

#### Autenticazione

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PATCH /api/auth/me`
- `POST /api/auth/registrazione`

#### Dominio clinico e organizzativo

- `GET /api/specialita`
- `GET /api/specialita/{specialita_id}/prestazioni`
- `GET /api/medici`
- `GET /api/medici/{medico_id}/slot`
- `GET /api/pazienti`
- `GET /api/pazienti/{paziente_id}/referti`
- `GET/POST/PATCH /api/prenotazioni...`
- `GET /api/visite`
- `GET /api/visite/{visita_id}`
- `PATCH /api/visite/{visita_id}/relazione`
- `POST /api/visite/{visita_id}/referti`
- `GET /api/referti/{referto_id}/download`

#### Monitoraggio e analytics

- `GET /api/health`
- `GET /api/metrics`
- `GET /api/statistiche/overview`
- `GET /api/statistiche/prenotazioni/trend`
- `GET /api/statistiche/top-specialita`
- `GET /api/statistiche/revenue/by-specialita`
- `GET /api/statistiche/kpi/no-show-rate`
- `GET /api/statistiche/kpi/avg-time-to-referto`

#### Flusso guest

- `POST /api/visite/guest`
- `GET /api/visite/{visita_id}/relazione/print`
- `GET /api/referti/{referto_id}/download` con `token` e `codice_fiscale`

---

## Funzionalità per ruolo

## Area paziente

L'area paziente è composta principalmente dalle seguenti pagine:

- `PazienteDashboard`
- `NuovaPrenotazione`
- `StoricoPrenotazioni`
- `PazienteReferti`
- `PazienteProfilo`
- `PazienteVisita`

### Dashboard paziente

La dashboard mostra:

- un riepilogo della prossima prenotazione;
- accessi rapidi alla nuova prenotazione;
- accesso allo storico;
- accesso ai referti.

Per comporre il riepilogo iniziale, il frontend interroga in parallelo:

- prenotazioni future;
- elenco medici;
- elenco specialità.

Questo permette di arricchire la prenotazione con metadati leggibili lato UI.

### Nuova prenotazione

La pagina `src/pages/paziente/NuovaPrenotazione.js` implementa un flusso guidato:

1. caricamento delle specialità;
2. selezione della specialità;
3. caricamento dei medici filtrati per specialità;
4. caricamento delle prestazioni collegate;
5. selezione data;
6. interrogazione dinamica degli slot disponibili del medico;
7. invio della prenotazione al backend.

Si tratta di una sequenza molto significativa dal punto di vista progettuale, perché dimostra un frontend **data-driven**, dove il contenuto del form dipende in cascata dalle scelte precedenti.

Snippet significativo:

```javascript
const resp = await mediciService.getSlots(medicoIdForSlots, dataForSlots);
setSlots(Array.isArray(resp.data) ? resp.data : []);
```

Questa riga evidenzia come il frontend non usi orari statici ma interroghi la disponibilità reale lato backend.

### Referti del paziente

La pagina `PazienteReferti` mostra una tabella con:

- data visita;
- titolo del referto;
- medico associato;
- azione di apertura visita;
- download del file.

È presente anche gestione della paginazione server-side mediante `page` e `page_size`.

---

## Area medico

L'area medico ruota attorno a:

- `MedicoDashboard`
- `MedicoVisita`
- `pages/medico/Paziente.js`

### Dashboard medico

Mostra:

- prossime visite confermate;
- ricerca paziente;
- calendario appuntamenti personale.

L'approccio è operativo: il medico vede subito i prossimi appuntamenti e può aprire direttamente la visita.

### Gestione della visita

La pagina `MedicoVisita` è una delle più ricche del progetto. Consente di:

- visualizzare i dati della prenotazione;
- aggiornare lo stato della prenotazione;
- visualizzare i referti già associati al paziente;
- compilare o aggiornare la relazione clinica con editor WYSIWYG;
- generare il PDF della relazione clinica;
- creare un nuovo referto;
- caricare un allegato associato al referto.

Da un punto di vista accademico, questa pagina incarna molto bene il concetto di **postazione digitale del medico**.

Snippet significativo:

```javascript
await visiteService.updateRelazione(visitaId, { relazione_clinica: relazioneClinica });
```

e per la stampa:

```javascript
const res = await visiteService.printRelazione(visitaId);
const blob = res.data || res;
const url = window.URL.createObjectURL(blob);
window.open(url, '_blank');
```

Qui emerge chiaramente l'integrazione tra frontend editoriale e backend documentale.

---

## Area segreteria

L'area segreteria è orientata alla gestione trasversale del flusso prenotazioni/pazienti.

Le funzionalità principali includono:

- visione aggregata del calendario appuntamenti;
- filtro per medico;
- filtro per paziente;
- ricerca paziente;
- apertura scheda paziente;
- creazione di nuove prenotazioni.

Questa area può essere vista come la console operativa del personale amministrativo di front office.

---

## Area amministratore

La pagina `AmministratoreDashboard` realizza un vero e proprio cruscotto di business intelligence semplificato.

### KPI mostrati

Fra gli indicatori caricati via `statisticsService.overview()`:

- utenti totali;
- utenti guest;
- nuovi utenti nell'ultimo mese;
- prenotazioni totali;
- nuove prenotazioni ultimi 30 giorni;
- prenotazioni completate ultimi 30 giorni;
- prenotazioni confermate;
- numero totale referti;
- numero totale visite;
- numero totale medici;
- ricavi ultimi 30 giorni;
- ricavi non incassati ultimi 30 giorni.

### Grafici disponibili

- trend prenotazioni per giorno;
- top specialità per volume prenotazioni;
- ricavi per specialità.

Questo modulo è particolarmente rilevante in una tesi perché mostra come un frontend clinico non sia limitato alle operazioni transazionali, ma includa anche strumenti di supporto decisionale.

---

## Flusso guest tramite token e codice fiscale

Una funzionalità originale del sistema è il flusso **guest**, destinato a chi deve accedere a una visita o a un referto senza autenticazione tradizionale.

### Passaggi del flusso

1. l'utente apre un link contenente un `token`;
2. la pagina `AccessoGuest` richiede anche il codice fiscale;
3. il frontend invia `token + codice_fiscale` a `POST /api/visite/guest`;
4. il backend restituisce i dati della visita e i referti disponibili;
5. il frontend memorizza i dati necessari in `localStorage`;
6. l'utente viene indirizzato a `/visita-guest/:id`.

### Significato architetturale

Questo flusso dimostra la gestione di un accesso eccezionale ma controllato, utile in contesti reali come:

- consegna referti via link dedicato;
- accesso rapido da QR code;
- condivisione sicura di documenti sanitari senza account persistente.

È una soluzione interessante, anche se in una discussione di tesi conviene sottolineare che l'uso di `localStorage` per dati sensibili guest non è la soluzione più forte possibile in ottica security-hardening.

---

## Componenti riusabili di particolare interesse

## `CalendarAppointments`

È uno dei componenti più significativi dell'intero progetto.

Funzioni principali:

- visualizzazione mensile degli appuntamenti con `FullCalendar`;
- fetch dinamico delle prenotazioni del mese corrente;
- filtro opzionale per medico;
- filtro opzionale per paziente;
- navigazione mese/anno;
- apertura della visita dal calendario.

Dal punto di vista tecnico, è apprezzabile la presenza di:

- cache semplice dell'ultimo mese caricato;
- prevenzione di richieste duplicate in-flight;
- ricostruzione degli eventi da dati backend.

Snippet significativo:

```javascript
const monthKey = `${medicoId || 'all'}-${visibleDate.getFullYear()}-${visibleDate.getMonth()}`;
if (lastFetchedMonthRef.current === monthKey) return;
if (inFlightFetches.current.has(monthKey)) return;
```

Questo evidenzia attenzione a performance e anti-loop nelle richieste.

## `PatientSearch`

Implementa una ricerca pazienti con debounce e apertura rapida del dettaglio.

È riusato in area medico e segreteria, mostrando un buon livello di riusabilità del codice.

## `RefertoItem` + `RefertoDownload`

Separano la logica di presentazione del referto da quella di download, favorendo modularità.

---

## Scelte progettuali rilevanti

## 1. Centralizzazione degli endpoint

La presenza di `src/api/endpoints.js` evita stringhe hardcoded disperse nel codice.

Benefici:

- manutenzione semplificata;
- minore rischio di errori;
- miglior leggibilità architetturale.

## 2. Service layer dedicato

I componenti non chiamano direttamente Axios, ma usano servizi come:

- `authService`
- `prenotazioniService`
- `visiteService`
- `statisticsService`

Questo è un pattern corretto per applicazioni medio-grandi.

## 3. RBAC lato routing

Il controllo di accesso non è relegato solo al backend: il frontend filtra e instrada correttamente gli utenti.

## 4. UI moderna e responsive

Material UI consente una presentazione professionale, adatta a un gestionale sanitario.

## 5. Ricorso a rich text editor

L'uso di `ReactQuill` per relazione clinica e testo referto rende il sistema più aderente a un contesto medico reale, dove il documento non è banale testo plain.

---

## Modello dati inferibile dal contratto API

Non è stato possibile interrogare direttamente il database MySQL perché la connessione non risulta configurata nello strumento disponibile. Tuttavia, dalla specifica OpenAPI si ricavano chiaramente le principali entità di dominio.

### Entità principali

#### Utente (`UserOut`)

Campi osservabili:

- `id`
- `nome`
- `cognome`
- `email`
- `ruolo`
- `codice_fiscale`
- `telefono`
- `is_guest`

#### Medico (`MedicoOut`)

- `id`
- `nome`
- `cognome`
- `specialita_id`

#### Specialità (`SpecialitaOut`)

- `id`
- `nome`

#### Prestazione (`PrestazioneRichiestaOut`)

- `id`
- `specialita_id`
- `nome`
- `descrizione`
- `prezzo`

#### Prenotazione (`PrenotazioneOut`)

- `id`
- `visita_id`
- `paziente`
- `specialita`
- `medico`
- `data_visita`
- `orario_inizio`
- `stato`
- `pagato`
- `prestazione_richiesta`

#### Visita (`VisitaOut`)

- `id`
- `prenotazione_id`
- `relazione_clinica`
- `prenotazione`

#### Referto (`RefertoOut`)

- `referto_id`
- `visita_id`
- `prenotazione_id`
- `data_visita`
- `medico`
- `paziente`
- `titolo`
- `testo_referto`
- `formato`

### Relazioni di dominio deducibili

- un **medico** appartiene a una **specialità**;
- una **specialità** possiede più **prestazioni**;
- una **prenotazione** collega **paziente**, **medico**, **specialità** e opzionalmente **prestazione richiesta**;
- una **prenotazione** può generare una **visita**;
- una **visita** può generare uno o più **referti**;
- il **referto** è il documento clinico scaricabile associato alla visita.

Se in seguito verranno fornite le credenziali del database, questa sezione può essere arricchita con schema relazionale reale, tipi SQL, chiavi primarie, chiavi esterne e cardinalità esatte.

---

## Punti di forza del progetto

- buona separazione delle responsabilità;
- integrazione coerente con backend FastAPI;
- copertura di casi d'uso reali del dominio sanitario;
- gestione multi-ruolo concreta;
- dashboard amministrativa con analytics;
- flusso guest originale e utile;
- uso corretto di form dinamici e fetch dipendenti;
- esperienza utente moderna grazie a Material UI e FullCalendar.

---

## Possibili miglioramenti progettuali da citare in tesi

Per una trattazione critica e matura, conviene riportare anche alcuni possibili miglioramenti.

### Sicurezza

- attualmente i token sono conservati in `localStorage`;
- una soluzione più sicura sarebbe usare **refresh token in cookie HttpOnly**;
- anche i dati guest potrebbero essere gestiti con sessione più temporanea o storage meno esposto.

### Tipizzazione

- il progetto è in JavaScript puro;
- un'evoluzione naturale sarebbe la migrazione a **TypeScript**, utile soprattutto in ambito enterprise e sanitario.

### Testing

- il repository contiene la struttura standard di test CRA, ma dall'analisi del codice non emerge una copertura significativa delle funzionalità core;
- per robustezza accademica e industriale sarebbe utile aggiungere unit test e integration test su auth, ruoli, servizi e flussi principali.

### Gestione stato avanzata

- al momento lo stato globale è limitato all'autenticazione;
- in un'evoluzione futura si potrebbe valutare React Query o Redux Toolkit per caching, sincronizzazione e invalidazione dati.

### Accessibilità e privacy

- sarebbe utile formalizzare un audit di accessibilità;
- per un contesto sanitario reale, andrebbero esplicitati meglio i vincoli GDPR e la protezione dei dati sensibili.

---

## Informazioni utili per presentazione di tesi

Se devi descrivere il progetto in modo sintetico ma rigoroso, puoi presentarlo così:

> Clinica Eir è una single-page application React che funge da interfaccia operativa per un ecosistema clinico basato su backend FastAPI. Il sistema adotta controllo accessi per ruoli, autenticazione JWT con refresh automatico, gestione completa del flusso di prenotazione-visita-referto e una dashboard amministrativa con KPI e grafici statistici. L'applicazione integra componenti di calendario, ricerca, editor rich text e download documentale, configurandosi come un esempio concreto di frontend gestionale sanitario moderno.

---

## Estratti di codice particolarmente rappresentativi

### 1. Protezione delle rotte per ruolo

File: `src/components/ProtectedRoute.js`

```javascript
if (!user) {
	return <Navigate to="/login" replace />;
}

if (allowedRoles && !allowedRoles.includes(user.ruolo)) {
	return <Navigate to={getDashboardRoute(user.ruolo)} replace />;
}
```

Perché è importante: mostra un controllo accessi lato frontend semplice, leggibile e coerente con il modello RBAC.

### 2. Refresh automatico della sessione

File: `src/api/client.js`

```javascript
if (
	error.response?.status === 401 &&
	!originalRequest._retry &&
	originalRequest.url !== endpoints.auth.login &&
	originalRequest.url !== endpoints.auth.refresh
) {
	originalRequest._retry = true;
	const refreshToken = localStorage.getItem('refresh_token');
```

Perché è importante: dimostra robustezza nella gestione della continuità di sessione.

### 3. Prenotazione guidata con slot dinamici

File: `src/pages/paziente/NuovaPrenotazione.js`

```javascript
const resp = await mediciService.getSlots(medicoIdForSlots, dataForSlots);
setSlots(Array.isArray(resp.data) ? resp.data : []);
```

Perché è importante: collega direttamente la UI allo stato reale della disponibilità del medico.

### 4. Produzione della relazione clinica

File: `src/pages/medico/MedicoVisita.js`

```javascript
await visiteService.updateRelazione(visitaId, { relazione_clinica: relazioneClinica });
```

Perché è importante: rappresenta il passaggio dalla visita operativa al documento clinico persistito lato server.

### 5. Dashboard amministrativa con analytics

File: `src/pages/amministratore/AmministratoreDashboard.js`

```javascript
const res = await statisticsService.overview();
setOverview(res.data || res);
```

Perché è importante: evidenzia la dimensione manageriale del sistema oltre a quella transazionale.

---

## Avvio del progetto

### Requisiti

- Node.js installato
- backend FastAPI attivo su `http://127.0.0.1:8000`

### Installazione dipendenze

```powershell
npm install
```

### Avvio in sviluppo

```powershell
npm start
```

### Build di produzione

```powershell
npm run build
```

---

## Limiti dell'analisi corrente

Questa documentazione è stata redatta analizzando:

- il codice sorgente del frontend;
- la struttura del progetto;
- il contratto `openapi.json` del backend FastAPI.

Non è stato invece possibile analizzare direttamente lo schema MySQL, perché lo strumento di accesso al database richiede una configurazione di connessione non presente nel contesto corrente.

Se verranno forniti i parametri di connessione, si potrà integrare il README con:

- elenco reale delle tabelle;
- chiavi primarie e chiavi esterne;
- corrispondenza fra schema SQL e modelli API;
- osservazioni di coerenza tra persistenza, dominio e frontend.

---

## Conclusione

Il frontend di Clinica Eir rappresenta un progetto ben strutturato, con un perimetro funzionale ampio e coerente con un caso d'uso sanitario reale. L'applicazione non si limita alla semplice visualizzazione di dati, ma implementa un flusso completo che copre autenticazione, operatività clinica, consultazione documentale, accesso guest e analytics amministrative.

Per una tesi universitaria, il progetto offre numerosi spunti di analisi:

- progettazione di SPA con React;
- integrazione frontend/backend via REST;
- gestione della sicurezza applicativa;
- organizzazione per ruoli;
- modellazione del dominio prenotazione-visita-referto;
- costruzione di interfacce operative per contesti professionali.

In sintesi, si tratta di un caso di studio concreto e credibile di **piattaforma web gestionale sanitaria full stack**, in cui il frontend svolge un ruolo attivo nella qualità dell'esperienza utente, nella mediazione dei processi clinici e nella valorizzazione dei dati prodotti dal backend.
