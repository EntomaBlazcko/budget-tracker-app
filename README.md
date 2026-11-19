# Tally - Pocket Tracker

A simple mobile budget tracker built with **Ionic 9 + Angular 22 standalone components** and
**Capacitor 8**. It runs in the browser and as an Android app. Transactions and the monthly
budget are created, read, updated, and deleted through a small **REST API**; the app keeps a
local Preferences cache so it still works offline.

## Features

- Dashboard with this month's income, expenses, and balance, plus a recent-transactions list
- Activity screen with filters, grouped transactions, edit/delete swipe actions, and receipt photos
- Budget screen with a monthly limit, progress bar, category doughnut chart, and a vibration toggle
- Receipt photos from the device camera (approved sensor)
- Vibration feedback on save/delete/errors and when a new expense passes the limit (platform feature)
- REST CRUD through `server/index.js`, with offline fallback to `@capacitor/preferences`

## Role allocation

This is a **solo project**, so one student handles every role from the course brief:

| Role | Work in this repo |
| --- | --- |
| UI/UX Design and Frontend Development | `src/app/*` pages, `src/global.scss`, `src/theme/variables.scss` |
| Development and Integration of Sensors | `@capacitor/camera` in `add-expense`, receipt viewer in `activity` |
| Development and Integration of Platform-Specific Features | `@capacitor/haptics` via `src/app/services/vibration.service.ts` |
| Development and Integration of RESTful APIs (Client Side) | `src/app/services/api.service.ts` + `api.config.ts` |
| Backend Server Development and API Endpoint Implementation | `server/index.js` |

## Run locally

```powershell
npm install
npm run start:api     # REST API at http://localhost:3000/api
npm start             # app at http://localhost:4200
```

Open two terminals: one for the API, one for the app. If the API is not running, the app falls
back to its local cache, so all screens still work.

### REST endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET | `/api/transactions` | List all transactions |
| GET | `/api/transactions/:id` | Get one transaction |
| POST | `/api/transactions` | Create a transaction |
| PUT | `/api/transactions/:id` | Update a transaction |
| DELETE | `/api/transactions/:id` | Delete a transaction |
| GET | `/api/budget` | Get the monthly limit |
| PUT | `/api/budget` | Save the monthly limit |

Data is stored in `server/data/*.json`, which is generated on first run and gitignored.

### Pointing the Android app at the API

`src/app/services/api.config.ts` points at the development PC's LAN IP so the REST demo works on a
physical phone. `localhost` would mean the phone itself, so if the PC gets a different IP, change:

```ts
export const API_BASE_URL = 'http://192.168.100.17:3000/api';
```

Keep the phone on the same Wi-Fi and make sure the API is reachable from the device. Plain HTTP is
allowed by `server.androidScheme = 'http'` + `server.cleartext = true` in `capacitor.config.ts` and
`android:usesCleartextTraffic="true"` in `AndroidManifest.xml`; without these, the WebView blocks
the API as mixed content.

## Build and test

```powershell
npm run lint           # ESLint + e2e typecheck + Prettier
npm run test:unit      # Vitest
npm run test:e2e       # Playwright (starts its own web server)
npm run build          # web bundle in www/
```

## Build the Android APK

```powershell
npm run sync:android
npx cap open android
```

In Android Studio, use **Build > Build Bundle(s) / APK(s) > Build APK(s)**, or run
`.\gradlew.bat assembleDebug` inside `android/`. Install on a connected device with:

```powershell
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
```

The application id is `com.tally.budgettracker`.

## Demo checklist

- [ ] Start the REST API and show the app reading from it
- [ ] Add, edit, and delete a transaction live
- [ ] Attach a receipt with the camera and open it from Activity
- [ ] Change the monthly limit and trigger the vibration alert by going over budget
- [ ] Show the GitHub commit history for this solo project
- [ ] Submit the repository link in Google Classroom
