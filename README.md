# Fassara — Multilingual Speech-to-Text and Translation

A final-year MERN project that records or uploads Hausa/English speech, transcribes it, translates it into the other supported language, and saves useful results.

## Main features

- Record speech with the browser microphone
- Upload an existing audio file
- Hausa to English and English to Hausa
- Original transcript and translated result
- Copy, save, delete, and clear history
- MongoDB persistence with an automatic in-memory fallback during setup
- Gemini audio processing through the backend
- Gemini 3.1 Flash TTS voice playback for translated text
- Safe demo mode before an API key is configured
- Responsive desktop and mobile interface

## Run the project

1. Install the root helper:

   ```bash
   npm install
   ```

2. Install the frontend and backend packages:

   ```bash
   npm run install:all
   ```

3. Copy `backend/.env.example` to `backend/.env` and add your values.

4. Start both applications:

   ```bash
   npm run dev
   ```

5. Open `http://localhost:5173`.

## Real AI mode

The starter uses `DEMO_MODE=true`, allowing the complete interface and history flow to be tested without consuming API credits. To process real recordings, add a Gemini API key and change it to:

```env
DEMO_MODE=false
```

The recommended Gemini model settings are:

```env
GEMINI_MODEL=gemini-3.6-flash
GEMINI_TTS_MODEL=gemini-3.1-flash-tts-preview
GEMINI_TTS_VOICE=Kore
```

The **Play** button inside the translated output generates fresh WAV audio through the backend and plays it in the browser. Voice generation requires a valid Gemini API key even when transcription demo mode is enabled.

Audio is limited to 15 MB by the Express upload middleware. The audio bytes are kept in memory only for the processing request and are not stored in MongoDB.

## Project structure

```text
frontend/src/
├── api/
├── components/
├── pages/
├── App.jsx
└── main.jsx

backend/
├── config/
├── controllers/
├── models/
├── routes/
├── services/
└── index.js
```
