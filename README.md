# AI Home Inspector

Take a photo of a deck, wall, roof, exterior, or yard. Gemini looks at the image and returns likely maintenance issues, sorted by severity, with a next step for each one.

This is an AI assistant, not a licensed home inspection.

## Setup

```bash
npm install
```

Copy `.env.example` to `.env.local` and add a [Google AI Studio](https://aistudio.google.com/apikey) key:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

1. Landing page (`/`) — start an inspection
2. Inspect page (`/inspect`) — camera or file upload, pick an area
3. `POST /api/inspect` — sends the photo to Gemini (`gemini-3.6-flash`)
4. Report — photo stays on screen; findings list what is visible and what to do

## Scripts

```bash
npm run dev    # local server
npm run build  # production build
npm run start  # serve the build
npm run lint
```
