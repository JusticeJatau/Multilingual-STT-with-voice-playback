# Fassara — Multilingual Speech-to-Text and Translation

**Fassara** is a multilingual speech-to-text and translation application that processes Hausa and English audio. Users can record speech directly from their browser or upload existing audio files, transcribe the speech, translate it into the other supported language, and save their results.

## Live Application

**Try Fassara:** https://fassara-nine.vercel.app/

The application is deployed with:
- **Frontend:** Vercel
- **Backend API:** Render
- **Database:** MongoDB Atlas
- **AI processing and voice generation:** Google Gemini

## Main Features

- Record speech using the browser microphone.
- Upload existing audio files.
- Hausa-to-English and English-to-Hausa transcription and translation.
- Display original transcripts alongside translated results.
- Copy, save, delete, and clear transcription history.
- MongoDB persistence with an automatic in-memory fallback.
- AI-powered audio processing through Google Gemini.
- Text-to-speech playback for translated text using Gemini TTS.
- Demo mode for testing the application without a configured Gemini API key.
- Responsive interface for desktop and mobile devices.

## Technology Stack

| Area | Technologies |
|---|---|
| Frontend | React 19, Vite 7 |
| Styling | Tailwind CSS 4 |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose 8 |
| AI processing | Google Gemini |
| Voice generation | Gemini TTS |
| Deployment | Vercel, Render |
| Database hosting | MongoDB Atlas |

## How to Use Fassara

1. Open the [Fassara application](https://fassara-nine.vercel.app/).
2. Select the source language and target language.
3. Record audio using your microphone or upload an existing audio file.
4. Submit the audio for processing.
5. View the original transcript and translated result.
6. Copy, save, or listen to the translated text.
7. Access your saved history when needed.

## Run the Project Locally

### Prerequisites

- Node.js and npm
- MongoDB database (optional if using the in-memory fallback)
- Google Gemini API key for real AI processing and voice generation

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/JusticeJatau/Multilingual-STT-and-voice-playback.git
   cd Multilingual-STT-and-voice-playback
   ```

2. Install the root helper dependencies:

   ```bash
   npm install
   ```

3. Install frontend and backend dependencies:

   ```bash
   npm run install:all
   ```

4. Copy `backend/.env.example` to `backend/.env` and configure your environment variables.

5. Start the frontend and backend:

   ```bash
   npm run dev
   ```

6. Open the application:

   ```text
   http://localhost:5173
   ```

## Environment Configuration

### Backend

Configure your `backend/.env` file with the required values.

Example AI configuration:

```env
DEMO_MODE=false
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.6-flash
GEMINI_TTS_MODEL=gemini-3.1-flash-tts-preview
GEMINI_TTS_VOICE=Kore
```

Also configure your MongoDB connection string and any other variables required by `backend/.env.example`.

### Frontend

For local development, the Vite development server proxies API requests to the backend.

For production, configure the frontend environment variable:

```env
VITE_API_URL=https://multilingual-stt-backend-service.onrender.com/api
```

The frontend uses this variable to communicate with the deployed backend API.

**Important:** Environment variables beginning with `VITE_` are exposed to the browser. Never put private API keys or database credentials in frontend environment variables.

## Real AI Mode and Demo Mode

The application supports demo mode so the interface and history workflow can be tested without consuming Gemini API credits.

To enable real AI processing, configure a valid Gemini API key and set:

```env
DEMO_MODE=false
```

The recommended Gemini model configuration is:

```env
GEMINI_MODEL=gemini-3.6-flash
GEMINI_TTS_MODEL=gemini-3.1-flash-tts-preview
GEMINI_TTS_VOICE=Kore
```

The **Play** button in the translated output generates WAV audio through the backend and plays it in the browser.

Voice generation requires a valid Gemini API key, even when transcription demo mode is enabled.

## Audio Processing and Storage

- Maximum audio upload size: **15 MB**.
- Audio files are processed in memory by the backend.
- Raw audio is not stored in MongoDB.
- Transcription history and saved results are persisted through MongoDB when the database is available.
- The application supports an in-memory fallback when MongoDB is unavailable.

## Deployment Architecture

Fassara uses a separate frontend and backend deployment.

```text
                 USER
                   |
                   v
          Vercel — React Frontend
                   |
                   v
          Render — Express API
                   |
          +--------+--------+
          |                 |
          v                 v
     Google Gemini      MongoDB Atlas
     AI Processing      Data Persistence
     Voice Generation
```

### Production URLs

| Service | URL |
|---|---|
| Frontend | https://fassara-nine.vercel.app/ |
| Backend | https://multilingual-stt-backend-service.onrender.com |

The frontend communicates with the backend through the configured `VITE_API_URL` environment variable. The backend must allow requests from the deployed frontend origin through its CORS configuration.

## Project Structure

```text
frontend/
└── src/
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

## Future Improvements

- Support for additional Nigerian and African languages.
- Improved transcription accuracy and language handling.
- More voice options for translated speech.
- Additional audio processing capabilities.

## Author

**Justice Yakubu Jatau**

Full Stack Developer

GitHub: https://github.com/JusticeJatau

---

**Fassara — Making Hausa and English communication easier through speech technology.**