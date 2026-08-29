# AI Home Inspector

Walk a room with the camera. The app captures frames and Gemini flags possible issues such as cracks, water stains, mold-like discoloration, peeling paint, wood deterioration, damaged siding, railing damage, missing caulk, and roof wear.

Findings include a confidence score and repair priority. Cost ranges are rough CAD estimates from the photo only.

This is an AI visual assessment only. It does not replace a professional home inspection.

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

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

## How it works

1. Landing (`/`) — start
2. My Home (`/home`) — rooms, issue counts, and repair priority
3. Room (`/rooms/[slug]`) — photos and findings
4. Scan (`/rooms/[slug]/scan`) — walk-around frame capture
5. `POST /api/inspect` — sends up to 8 frames to Gemini (`gemini-3.6-flash`)

Scans are stored in the browser (`localStorage`), not on a server.

## Scripts

```bash
npm run dev    # local server
npm run build  # production build
npm run start  # serve the build
npm run lint
```
