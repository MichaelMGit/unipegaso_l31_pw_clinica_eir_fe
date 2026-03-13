# Clinica Eir - Frontend

Frontend React del progetto **Clinica Eir**, realizzato nell’ambito del **Project Work Unipegaso L-31**.

Il repository rientra nel **tema n. 1 – La digitalizzazione dell’impresa**, **traccia 16: sviluppo di una applicazione full-stack API-based per un’organizzazione del settore sanitario**.

Questo repository contiene la **parte frontend** dell’applicazione e comunica con un backend separato.

## Contenuto del repository

Il progetto include:

- pagine React per i diversi ruoli applicativi;
- componenti UI riutilizzabili;
- contesto di autenticazione;
- client HTTP e servizi API;
- costanti e stili condivisi.

## Funzionalità principali

Le funzionalità gestite dal frontend comprendono:

- autenticazione e gestione sessione;
- dashboard differenziate per ruolo;
- prenotazione e consultazione appuntamenti;
- gestione visite, relazioni cliniche e referti;
- visualizzazione di statistiche e KPI amministrativi.

## Stack tecnologico

Il progetto è sviluppato con:

- **React**
- **React Router DOM**
- **Material UI**
- **Axios**
- **FullCalendar**
- **Chart.js**
- **SweetAlert2**

L’applicazione utilizza **Create React App** e gli script standard di `react-scripts`.

## Struttura principale

Le directory principali sono:

- `src/pages/` → pagine applicative, incluse quelle suddivise per ruolo;
- `src/components/` → componenti UI riutilizzabili;
- `src/api/` → client HTTP, endpoint e servizi;
- `src/contexts/` → gestione dello stato globale;
- `src/constants/` → costanti condivise;
- `src/styles/` → stili e risorse di presentazione.

## Elementi base del frontend

- `src/App.js` gestisce il routing pubblico, protetto e per ruolo;
- `src/contexts/AuthContext.js` centralizza sessione, bootstrap iniziale e refresh utente;
- `src/api/client.js` definisce il client Axios e gli interceptor;
- `src/api/services/` raccoglie i servizi applicativi che comunicano con il backend.

## Configurazione ambiente

Il file `.env` **non è incluso** nel repository e deve essere creato manualmente per l’avvio in locale.

La configurazione deve contenere almeno la variabile necessaria per il collegamento al backend, ad esempio:

`REACT_APP_API_URL=http://localhost:8000`

## Avvio del progetto

Installare le dipendenze:

```bash
npm install
```

Avviare l’ambiente di sviluppo:

```bash
npm start
```

Creare la build di produzione:

```bash
npm run build
```

## Integrazione con il backend

Questo repository contiene esclusivamente la **parte frontend** del sistema.  
Per il funzionamento completo dell’applicazione è necessario eseguire anche il backend associato, con cui il frontend comunica tramite **API HTTP/REST**.
