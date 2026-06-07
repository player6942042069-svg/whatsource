# WhatSource — Visual Media Identification Engine

> Upload any screenshot or video clip. WhatSource identifies the movie, anime, K-drama, or series — and shows you exactly where to watch it.

**Current Version:** v0.1.0 (High-Fidelity Frontend Prototype)  
**Status:** Mock data — no live AI backend yet

---

## ✨ Features (Prototype)

- Drag-and-drop image / video upload with cinematic scanning animation
- Realistic confidence score + match result display
- Franchise timeline with cameo filter logic (direct narrative continuity only)
- Geo-aware streaming availability grid
- Global search counter (animated)
- Four demo presets: Inception, Attack on Titan, The Dark Knight, Parasite
- Full SpaceX-dark-cinematic design system

---

## 🚀 Deploy to Vercel (Recommended — Free)

### Option A: Deploy via Vercel CLI

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Go into the project folder
cd whatsource

# 3. Install dependencies
npm install

# 4. Deploy (follow the prompts — link to your account)
vercel

# 5. For production deployment
vercel --prod
```

Your site will be live at `https://whatsource-xxx.vercel.app`

---

### Option B: Deploy via GitHub + Vercel Dashboard (easiest)

1. Push this project to a **GitHub repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial WhatSource prototype"
   git remote add origin https://github.com/YOUR_USERNAME/whatsource.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) → **New Project**

3. Import your GitHub repository

4. Vercel auto-detects Vite — just click **Deploy**

5. Your site is live in ~60 seconds ✅

---

## 🌐 Deploy to Netlify (Alternative — Free)

### Option A: Drag-and-drop (zero CLI required)

```bash
# 1. Build the project
npm install
npm run build
```

2. Go to [netlify.com](https://app.netlify.com/drop)
3. **Drag the `/dist` folder** onto the Netlify drop zone
4. Done — you get a free `https://xxx.netlify.app` URL

### Option B: Netlify CLI

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

---

## 🛠 Local Development

```bash
npm install
npm run dev
# → http://localhost:5173
```

---

## 📁 Project Structure

```
whatsource/
├── index.html                    # Entry HTML
├── vite.config.js                # Vite config
├── vercel.json                   # Vercel SPA routing
├── package.json
└── src/
    ├── main.jsx                  # React root
    ├── App.jsx                   # State machine (landing → scanning → results)
    ├── styles/
    │   └── globals.css           # Design tokens, animations, base styles
    ├── data/
    │   └── mockResults.js        # Mock movie/anime data (swap for real API later)
    └── components/
        ├── LandingPage.jsx       # Hero, upload zone, demo tiles, how-it-works
        ├── ScanningPage.jsx      # Cinematic radar animation
        └── ResultsPage.jsx       # Confidence, franchise timeline, streaming grid
```

---

## 🗺 Roadmap (Next Steps)

| Phase | Feature | Notes |
|-------|---------|-------|
| v0.2 | TMDB API integration | Real posters, metadata, release dates |
| v0.3 | AniList API | Real anime data + seasonal indexing |
| v0.4 | IP geolocation | Real streaming availability by country |
| v0.5 | CLIP vision model | Actual image matching (requires backend) |
| v1.0 | Full production backend | PostgreSQL + pgvector + GPU inference |

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| `--bg-void` | `#030507` |
| `--accent` | `#3b82f6` |
| `--font-display` | Syne (Google Fonts) |
| `--font-body` | DM Sans |
| `--font-mono` | DM Mono |

---

*Built with Vite + React · Hosted on Vercel/Netlify free tier*
