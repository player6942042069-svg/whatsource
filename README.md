# WhatSource — Visual Media Identification Engine

> Upload any screenshot or clip. WhatSource identifies the exact movie, anime, K-drama or series — powered by real AI and live databases.

---

## 🚀 Deploy to Vercel (5 minutes)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "WhatSource v1.0"
git remote add origin https://github.com/YOUR_USERNAME/whatsource.git
git push -u origin main
```

### Step 2 — Import on Vercel

1. Go to **vercel.com** → New Project → Import your repo
2. Framework: **Vite** (auto-detected)
3. **Before clicking Deploy** → go to Environment Variables and add all keys below

### Step 3 — Add Environment Variables

In Vercel → Project Settings → Environment Variables, add each of these:

| Variable | Your Key |
|----------|----------|
| `GEMINI_API_KEY` | Your Google AI Studio key |
| `TMDB_API_KEY` | Your TMDB v3 API key |
| `WATCHMODE_API_KEY` | Your Watchmode key |
| `IPINFO_TOKEN` | Your IPinfo token |
| `OMDB_API_KEY` | Your OMDb key |
| `SAUCENAO_API_KEY` | Your SauceNAO key |
| `MOTN_API_KEY` | Your Movie of the Night RapidAPI key |

### Step 4 — Deploy

Click **Deploy**. Your site will be live at `https://whatsource-xxx.vercel.app` in ~60 seconds.

---

## 🏗️ Local Development

```bash
npm install
```

Create a `.env.local` file in the project root:
```
GEMINI_API_KEY=your_key
TMDB_API_KEY=your_key
WATCHMODE_API_KEY=your_key
IPINFO_TOKEN=your_key
OMDB_API_KEY=your_key
SAUCENAO_API_KEY=your_key
MOTN_API_KEY=your_key
```

Then run:
```bash
npm run dev
```

> Note: `/api` serverless functions require Vercel CLI for local testing:
> ```bash
> npm install -g vercel
> vercel dev
> ```

---

## 🔍 How Identification Works

```
User uploads image/video (up to 50MB)
        ↓
Client compresses to <3MB / extracts video frame
        ↓
        POST /api/analyze
       ↙              ↘
Trace.moe           Gemini 1.5 Flash
(anime scenes)      (movies/TV/dramas)
    +                    +
SauceNAO            (everything else)
(anime/manga)
        ↓
  Best result by confidence score
        ↓
   TMDB enrichment
   (poster, cast, ratings, franchise)
        ↓
   OMDb enrichment
   (IMDb rating, awards, box office)
        ↓
   Watchmode + Movie of the Night
   (streaming availability by country)
        ↓
   IPinfo region detection
   (auto-detects user's country)
        ↓
   Full results returned to frontend
```

---

## 📁 Project Structure

```
whatsource/
├── api/
│   ├── analyze.js      ← Main image analysis pipeline (Vercel serverless)
│   └── search.js       ← Text search: TMDB + AniList + Jikan + TVMaze
├── src/
│   ├── App.jsx         ← State machine + global paste listener
│   ├── main.jsx
│   ├── styles/
│   │   └── globals.css ← Design tokens, animations
│   ├── utils/
│   │   └── mediaUtils.js ← Image compression + video frame extraction
│   └── components/
│       ├── LandingPage.jsx   ← Upload/Paste/Search, hero design
│       ├── ScanningPage.jsx  ← Cinematic analysis animation
│       └── ResultsPage.jsx   ← Results, franchise timeline, streaming, age gate
├── index.html
├── vite.config.js
├── vercel.json
└── package.json
```

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Background | `#000000` (true black) |
| Surface | `#0e0e0e` |
| Accent | `#FFE500` (cinema gold) |
| Font Display | Unbounded 900 |
| Font Body | Outfit 300–600 |
| Font Mono | JetBrains Mono |

---

## 🆓 Free APIs Used

| API | Purpose | Key Required |
|-----|---------|-------------|
| Trace.moe | Anime scene ID | No |
| AniList | Anime metadata | No |
| Jikan (MAL) | Anime search backup | No |
| TVMaze | Global TV data | No |
| ip-api.com | Region detection fallback | No |
| Gemini 1.5 Flash | Vision AI for live-action | Yes (free) |
| TMDB | Movie/TV metadata | Yes (free) |
| Watchmode | Streaming availability | Yes (free tier) |
| IPinfo | IP geolocation | Yes (free) |
| OMDb | IMDb ratings + awards | Yes (free) |
| SauceNAO | Anime/manga image search | Yes (free) |
| Movie of the Night | Asian streaming platforms | Yes (free via RapidAPI) |

---

## ⚠️ Important Notes

- All API keys are stored as Vercel environment variables — **never in code**
- Vercel free tier: 100GB bandwidth, unlimited deployments
- Serverless function timeout: 30 seconds (set in vercel.json)
- Max image upload: 50MB on client, compressed to <3MB before API call
- Video: frame is extracted at 20% through the clip before analysis
- Age gate: 18+ content detected via TMDB `adult` flag + content ratings
