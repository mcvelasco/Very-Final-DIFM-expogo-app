# Do It For Me — Voice Notes App

A production-ready React Native mobile app built with **Expo SDK 52** (compatible with **Expo Go SDK 54**), **Expo Router v4**, and **Supabase**. Speak your thoughts and they become notes — instantly saved and accessible anywhere.

---

## ✨ Features

- 🎤 **Voice Recording** — Tap the mic, speak, done. Audio captured with `expo-av`.
- 📝 **Full Note CRUD** — Create, read, update, and delete notes with a polished UI.
- 🔐 **Auth** — Secure email/password login & registration via Supabase Auth.
- 🔒 **Row Level Security** — Every note is private to its owner at the database level.
- 💅 **Beautiful UI** — Linear gradients, soft shadows, animated mic button, bottom-sheet modals.

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
cd DoItForMe
npm install
```

### 2. Set Up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL Editor, paste and run **`supabase-setup.sql`**.
3. Go to **Authentication → Providers → Email** and make sure it's enabled.
4. Copy your **Project URL** and **anon/public key** from **Settings → API**.

### 3. Configure Credentials

Open `services/supabase.ts` and replace:

```ts
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### 4. Run

```bash
npx expo start
```

Scan the QR code with **Expo Go** on your device. This app targets **Expo SDK 52**, which is fully supported by Expo Go SDK 54.

---

## 📁 Project Structure

```
DoItForMe/
├── app/
│   ├── _layout.tsx              # Root layout, auth redirect
│   ├── index.tsx                # Entry → redirects to /(auth)/login
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx            # Login screen
│   │   └── register.tsx         # Register screen
│   └── (app)/
│       ├── _layout.tsx
│       ├── home.tsx             # Notes list + mic
│       └── edit.tsx             # Edit note
├── components/
│   ├── MicButton.tsx            # Animated recorder
│   └── NoteCard.tsx             # Note card with actions
├── services/
│   ├── supabase.ts              # Supabase client
│   └── notesService.ts          # CRUD operations
├── hooks/
│   └── useAuth.ts               # Auth state
├── supabase-setup.sql           # DB schema + RLS
├── app.json                     # Expo config (SDK 52)
└── package.json
```

---

## 🎙️ About Voice-to-Text

Expo Go's managed workflow does not include a native speech-recognition module. The mic button records real audio via `expo-av` and inserts a placeholder transcript so you can experience the full UI/UX flow.

To add real transcription in production, upload the recorded `.m4a` URI inside `MicButton.tsx` to one of:

| Service | Endpoint |
|---|---|
| OpenAI Whisper | `POST https://api.openai.com/v1/audio/transcriptions` |
| Google STT | `POST https://speech.googleapis.com/v1/speech:recognize` |
| AssemblyAI | `POST https://api.assemblyai.com/v2/transcript` |

---

## 🛡️ Security

- **Row Level Security** in Supabase — users can never touch another user's notes.
- Sessions persisted via **AsyncStorage**, auto-refreshed by Supabase client.
- Passwords are hashed by Supabase; never stored in the app.

---

## 📦 Key Dependencies (SDK 52)

| Package | Version |
|---|---|
| `expo` | ~52.0.0 |
| `expo-router` | ~4.0.17 |
| `expo-av` | ~15.0.2 |
| `react-native` | 0.76.7 |
| `@supabase/supabase-js` | ^2.45.0 |
| `react-native-reanimated` | ~3.16.2 |
| `react-native-paper` | ^5.12.3 |

---

## 📄 License

MIT — use freely in personal and commercial projects.
