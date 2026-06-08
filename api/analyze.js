// api/analyze.js — WhatSource main analysis pipeline
// Vercel serverless function

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).json({});
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { imageBase64, mimeType = 'image/jpeg', clientIp, searchHint } = req.body;
    if (!imageBase64 && !searchHint) return res.status(400).json({ error: 'No image or search data received' });

    // ── SEARCH HINT PATH (from text search) ──────────────────────────
    if (searchHint && !imageBase64) {
      const region = await detectRegion(clientIp || req.headers['x-forwarded-for'] || '');
      const fakeId = {
        title: searchHint.title, mediaType: searchHint.mediaType || 'movie',
        releaseYear: searchHint.year, confidence: 95,
        isAnime: searchHint.mediaType === 'anime',
        anilistId: searchHint.anilistId || null, source: 'search',
      };
      const tmdbData  = await enrichWithTMDB(fakeId);
      const omdbData  = tmdbData ? await enrichWithOMDb(tmdbData.title, tmdbData.year) : null;
      const streaming = tmdbData ? await getStreaming(tmdbData.tmdbId, tmdbData.mediaType, region, tmdbData.title) : [];
      const franchise = tmdbData ? await getFranchise(tmdbData) : [];
      const isAdult   = checkMaturity(tmdbData, fakeId);
      const result    = buildResponse({ identification: fakeId, tmdbData, omdbData, streaming, franchise, region, isAdult });
      return res.status(200).json({ success: true, result });
    }

    // Step 1 — Detect user region
    const region = await detectRegion(clientIp || req.headers['x-forwarded-for'] || '');

    // Step 2 — Run Trace.moe (anime) + Gemini (everything) in parallel
    const [traceResult, geminiResult] = await Promise.allSettled([
      runTraceMoe(imageBase64, mimeType),
      runGemini(imageBase64, mimeType),
    ]);

    // Step 3 — Also try SauceNAO for additional anime/manga coverage
    const sauceResult = await runSauceNAO(imageBase64).catch(() => null);

    // Step 4 — Pick best identification result
    const identification = pickBestResult(
      traceResult.status === 'fulfilled' ? traceResult.value : null,
      geminiResult.status === 'fulfilled' ? geminiResult.value : null,
      sauceResult,
    );

    if (!identification) {
      return res.status(200).json({ success: false, error: 'Could not identify this content. Try a clearer screenshot.' });
    }

    // Step 5 — Enrich with TMDB
    const tmdbData = await enrichWithTMDB(identification);

    // Step 6 — Enrich with OMDb for additional ratings
    const omdbData = tmdbData ? await enrichWithOMDb(tmdbData.title, tmdbData.year) : null;

    // Step 7 — Get streaming availability
    const streaming = tmdbData ? await getStreaming(tmdbData.tmdbId, tmdbData.mediaType, region, tmdbData.title) : [];

    // Step 8 — Build franchise/sequel tree
    const franchise = tmdbData ? await getFranchise(tmdbData) : [];

    // Step 9 — Maturity check
    const isAdult = checkMaturity(tmdbData, identification);

    const result = buildResponse({ identification, tmdbData, omdbData, streaming, franchise, region, isAdult });
    return res.status(200).json({ success: true, result });

  } catch (err) {
    console.error('Analyze error:', err);
    return res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
}

// ── STEP 1: Region Detection ──────────────────────────────────────────
async function detectRegion(ip) {
  try {
    const token = process.env.IPINFO_TOKEN;
    const cleanIp = (ip || '').split(',')[0].trim();
    if (!cleanIp || cleanIp === '::1' || cleanIp.startsWith('127.')) return 'US';
    const r = await fetch(`https://ipinfo.io/${cleanIp}?token=${token}`);
    const d = await r.json();
    return d.country || 'US';
  } catch { return 'US'; }
}

// ── STEP 2a: Trace.moe (Anime Scene Identification) ──────────────────
async function runTraceMoe(imageBase64, mimeType) {
  try {
    const blob = base64ToBlob(imageBase64, mimeType);
    const form = new FormData();
    form.append('image', blob, 'frame.jpg');

    const r = await fetch('https://api.trace.moe/search?anilistInfo', {
      method: 'POST', body: form,
    });
    const d = await r.json();
    if (!d.result?.length) return null;

    const top = d.result[0];
    if (top.similarity < 0.82) return null; // below 82% confidence, skip

    const title = top.anilist?.title?.english || top.anilist?.title?.romaji || extractAnimeTitle(top.filename);
    return {
      source: 'trace.moe',
      title,
      anilistId: top.anilist?.id,
      episode: top.episode,
      mediaType: 'anime',
      confidence: Math.round(top.similarity * 100),
      isAnime: true,
    };
  } catch (e) {
    console.warn('Trace.moe failed:', e.message);
    return null;
  }
}

// ── STEP 2b: Google Gemini Vision ────────────────────────────────────
async function runGemini(imageBase64, mimeType) {
  try {
    const key = process.env.GEMINI_API_KEY;
    const prompt = `You are a media identification expert. Analyze this image carefully.
Identify what movie, TV show, anime, K-drama, C-drama, or any other entertainment content this scene is from.
Look for visual clues: art style, costumes, settings, characters, text overlays, logos, film grain, animation style.

Return ONLY a valid JSON object with these exact keys:
{
  "title": "exact official title in English (or romanized if no English title exists)",
  "original_title": "title in original language if non-English",
  "release_year": 2023,
  "media_type": "movie" or "tv" or "anime",
  "confidence_score": 85,
  "episode_info": "Season X Episode Y if identifiable, otherwise null",
  "content_warning": "adult" or "family" or "general",
  "reason": "brief explanation of visual clues used"
}

If you cannot identify it with reasonable confidence (below 60%), return:
{ "title": null, "confidence_score": 0, "reason": "could not identify" }`;

    const body = {
      contents: [{
        parts: [
          { inline_data: { mime_type: mimeType, data: imageBase64 } },
          { text: prompt },
        ],
      }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 512 },
    };

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );
    const d = await r.json();
    const text = d.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    if (!parsed.title || parsed.confidence_score < 60) return null;
    return {
      source: 'gemini',
      title: parsed.title,
      originalTitle: parsed.original_title,
      mediaType: parsed.media_type || 'movie',
      confidence: parsed.confidence_score,
      episodeInfo: parsed.episode_info,
      contentWarning: parsed.content_warning,
      releaseYear: parsed.release_year,
      isAnime: parsed.media_type === 'anime',
      reason: parsed.reason,
    };
  } catch (e) {
    console.warn('Gemini failed:', e.message);
    return null;
  }
}

// ── STEP 2c: SauceNAO (Anime/Manga backup) ───────────────────────────
async function runSauceNAO(imageBase64) {
  try {
    const key = process.env.SAUCENAO_API_KEY;
    const blob = base64ToBlob(imageBase64, 'image/jpeg');
    const form = new FormData();
    form.append('file', blob, 'image.jpg');
    form.append('output_type', '2');
    form.append('api_key', key);
    form.append('numres', '3');
    form.append('db', '999');

    const r = await fetch('https://saucenao.com/search.php', { method: 'POST', body: form });
    const d = await r.json();
    const results = d.results?.filter(x => parseFloat(x.header?.similarity) > 70) || [];
    if (!results.length) return null;

    const top = results[0];
    const sim = parseFloat(top.header.similarity);
    const data = top.data;
    return {
      source: 'saucenao',
      title: data?.source || data?.title || null,
      confidence: Math.round(sim),
      isAnime: true,
      mediaType: 'anime',
    };
  } catch { return null; }
}

// ── STEP 3: Pick best result ──────────────────────────────────────────
function pickBestResult(trace, gemini, sauce) {
  const candidates = [trace, gemini, sauce].filter(Boolean);
  if (!candidates.length) return null;
  // Prefer trace.moe for anime if confidence >= 88
  if (trace?.confidence >= 88) return trace;
  // Otherwise take highest confidence
  return candidates.sort((a, b) => b.confidence - a.confidence)[0];
}

// ── STEP 4: TMDB Enrichment ───────────────────────────────────────────
async function enrichWithTMDB(id) {
  try {
    const key = process.env.TMDB_API_KEY;
    const isAnime = id.isAnime || id.mediaType === 'anime';
    const searchType = id.mediaType === 'movie' ? 'movie' : 'multi';
    const year = id.releaseYear || '';

    // Search TMDB
    const searchUrl = `https://api.themoviedb.org/3/search/${searchType}?api_key=${key}&query=${encodeURIComponent(id.title)}&language=en-US${year ? `&year=${year}` : ''}`;
    const sr = await fetch(searchUrl);
    const sd = await sr.json();
    const results = sd.results || [];
    if (!results.length) return null;

    // For anime, also try AniList for better metadata
    if (isAnime && id.anilistId) {
      const aniData = await fetchAniListById(id.anilistId);
      if (aniData) return buildFromAniList(aniData, id);
    }

    const top = results[0];
    const isMovie = (top.media_type || id.mediaType) === 'movie';
    const tmdbId = top.id;
    const mediaType = isMovie ? 'movie' : 'tv';

    // Fetch full details + credits + collection
    const [detail, credits] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${key}&language=en-US&append_to_response=belongs_to_collection,content_ratings,release_dates`).then(r => r.json()),
      fetch(`https://api.themoviedb.org/3/${mediaType}/${tmdbId}/credits?api_key=${key}&language=en-US`).then(r => r.json()),
    ]);

    const title = detail.title || detail.name;
    const year2 = parseInt((detail.release_date || detail.first_air_date || '0000').slice(0, 4));
    const poster = detail.poster_path ? `https://image.tmdb.org/t/p/w500${detail.poster_path}` : null;
    const backdrop = detail.backdrop_path ? `https://image.tmdb.org/t/p/w1280${detail.backdrop_path}` : null;
    const director = isMovie
      ? credits.crew?.find(c => c.job === 'Director')?.name
      : detail.created_by?.[0]?.name;
    const cast = (credits.cast || []).slice(0, 6).map(c => ({ name: c.name, character: c.character, photo: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null }));
    const genres = (detail.genres || []).map(g => g.name);
    const runtime = isMovie ? (detail.runtime ? `${detail.runtime} min` : null) : (detail.episode_run_time?.[0] ? `${detail.episode_run_time[0]} min/ep` : null);
    const rating = getRating(detail, isMovie);
    const isAdultTMDB = detail.adult || false;

    return {
      tmdbId, mediaType, title, year: year2, poster, backdrop,
      synopsis: detail.overview || '',
      genres, director, cast, runtime, rating,
      tmdbScore: detail.vote_average ? detail.vote_average.toFixed(1) : null,
      isAdult: isAdultTMDB,
      collectionId: detail.belongs_to_collection?.id || null,
      seasons: !isMovie ? detail.number_of_seasons : null,
      episodes: !isMovie ? detail.number_of_episodes : null,
      status: detail.status,
      productionCountries: (detail.production_countries || []).map(c => c.name),
    };
  } catch (e) {
    console.warn('TMDB enrichment failed:', e.message);
    return null;
  }
}

// ── AniList enrichment (for anime identified by Trace.moe) ───────────
async function fetchAniListById(id) {
  try {
    const query = `query($id:Int){Media(id:$id,type:ANIME){id title{english romaji} coverImage{large} bannerImage description genres averageScore episodes format status startDate{year} studios(isMain:true){nodes{name}} isAdult relations{edges{relationType(version:2) node{id title{english romaji} coverImage{large} format startDate{year} type}}}}}`;
    const r = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { id } }),
    });
    const d = await r.json();
    return d.data?.Media || null;
  } catch { return null; }
}

function buildFromAniList(m, id) {
  const title = m.title?.english || m.title?.romaji;
  const DIRECT = ['PREQUEL', 'SEQUEL', 'PARENT'];
  const franchise = (m.relations?.edges || [])
    .filter(e => DIRECT.includes(e.relationType) && e.node?.type === 'ANIME')
    .map(e => ({ title: e.node.title?.english || e.node.title?.romaji, year: e.node.startDate?.year, relation: mapRelation(e.relationType), poster: e.node.coverImage?.large }))
    .sort((a, b) => (a.year || 9999) - (b.year || 9999));

  return {
    tmdbId: null, mediaType: 'anime', title,
    year: m.startDate?.year,
    poster: m.coverImage?.large || null,
    backdrop: m.bannerImage || null,
    synopsis: (m.description || '').replace(/<[^>]*>/g, '').slice(0, 500),
    genres: m.genres?.slice(0, 5) || [],
    director: m.studios?.nodes?.[0]?.name || null,
    cast: [],
    runtime: m.episodes ? `${m.episodes} eps` : 'Ongoing',
    rating: m.isAdult ? 'TV-MA' : 'TV-14',
    tmdbScore: m.averageScore ? (m.averageScore / 10).toFixed(1) : null,
    isAdult: m.isAdult || false,
    _inlineFranchise: franchise,
    collectionId: null, seasons: null, episodes: m.episodes, status: m.status,
    productionCountries: ['Japan'],
  };
}

// ── STEP 5: OMDb enrichment ───────────────────────────────────────────
async function enrichWithOMDb(title, year) {
  try {
    const key = process.env.OMDB_API_KEY;
    const url = `http://www.omdbapi.com/?apikey=${key}&t=${encodeURIComponent(title)}${year ? `&y=${year}` : ''}&plot=short`;
    const r = await fetch(url);
    const d = await r.json();
    if (d.Response === 'False') return null;
    return { imdbRating: d.imdbRating, imdbVotes: d.imdbVotes, imdbId: d.imdbID, awards: d.Awards, boxOffice: d.BoxOffice, rated: d.Rated };
  } catch { return null; }
}

// ── STEP 6: Streaming availability ───────────────────────────────────
async function getStreaming(tmdbId, mediaType, region, title) {
  const results = [];

  // Try Watchmode first (Western-focused)
  try {
    const wmKey = process.env.WATCHMODE_API_KEY;
    if (tmdbId) {
      const searchType = mediaType === 'movie' ? 'movie' : 'tv';
      const sr = await fetch(`https://api.watchmode.com/v1/search/?apiKey=${wmKey}&search_field=tmdb_${searchType}_id&search_value=${tmdbId}`);
      const sd = await sr.json();
      const wmId = sd.title_results?.[0]?.id;
      if (wmId) {
        const sr2 = await fetch(`https://api.watchmode.com/v1/title/${wmId}/sources/?apiKey=${wmKey}&regions=${region}`);
        const sd2 = await sr2.json();
        const seen = new Set();
        (sd2 || []).forEach(s => {
          if (!seen.has(s.name) && s.type !== 'buy' && s.type !== 'rent') {
            seen.add(s.name);
            results.push({ name: s.name, type: s.type, url: s.web_url, region });
          }
        });
      }
    }
  } catch (e) { console.warn('Watchmode failed:', e.message); }

  // Try Movie of the Night (better Asian platform coverage)
  try {
    const motnKey = process.env.MOTN_API_KEY;
    const r = await fetch(
      `https://streaming-availability.p.rapidapi.com/shows/search/title?title=${encodeURIComponent(title)}&country=${region.toLowerCase()}&show_type=${mediaType === 'movie' ? 'movie' : 'series'}&output_language=en`,
      { headers: { 'X-RapidAPI-Key': motnKey, 'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com' } }
    );
    const d = await r.json();
    const shows = Array.isArray(d) ? d : [];
    const topShow = shows[0];
    if (topShow?.streamingOptions) {
      const regionOptions = topShow.streamingOptions[region.toLowerCase()] || topShow.streamingOptions['us'] || [];
      const seen = new Set(results.map(r => r.name.toLowerCase()));
      regionOptions.forEach(opt => {
        const name = opt.service?.name;
        if (name && !seen.has(name.toLowerCase()) && opt.type !== 'buy' && opt.type !== 'rent') {
          seen.add(name.toLowerCase());
          results.push({ name, type: opt.type, url: opt.link, region });
        }
      });
    }
  } catch (e) { console.warn('MOTN failed:', e.message); }

  // Fallback — TVMaze for TV shows (free, no key)
  if (!results.length && (mediaType === 'tv' || mediaType === 'anime')) {
    try {
      const r = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(title)}`);
      const d = await r.json();
      if (d.network?.name) results.push({ name: d.network.name, type: 'subscription', url: d.url, region: 'TV' });
    } catch {}
  }

  return results;
}

// ── STEP 7: Franchise / sequel tree ──────────────────────────────────
async function getFranchise(tmdbData) {
  if (tmdbData._inlineFranchise) return tmdbData._inlineFranchise;
  if (!tmdbData.tmdbId) return [];

  try {
    const key = process.env.TMDB_API_KEY;

    if (tmdbData.mediaType === 'movie' && tmdbData.collectionId) {
      const r = await fetch(`https://api.themoviedb.org/3/collection/${tmdbData.collectionId}?api_key=${key}&language=en-US`);
      const d = await r.json();
      return (d.parts || [])
        .sort((a, b) => (a.release_date || '').localeCompare(b.release_date || ''))
        .map(p => ({
          title: p.title,
          year: parseInt((p.release_date || '0').slice(0, 4)),
          relation: p.id === tmdbData.tmdbId ? 'THIS TITLE' : 'PART OF SERIES',
          poster: p.poster_path ? `https://image.tmdb.org/t/p/w200${p.poster_path}` : null,
        }));
    }

    if (tmdbData.mediaType === 'tv') {
      const r = await fetch(`https://api.themoviedb.org/3/tv/${tmdbData.tmdbId}?api_key=${key}&language=en-US&append_to_response=seasons`);
      const d = await r.json();
      return (d.seasons || [])
        .filter(s => s.season_number > 0)
        .map(s => ({
          title: `${tmdbData.title} — Season ${s.season_number}`,
          year: parseInt((s.air_date || '0').slice(0, 4)),
          relation: 'SEASON',
          poster: s.poster_path ? `https://image.tmdb.org/t/p/w200${s.poster_path}` : tmdbData.poster,
          episodes: s.episode_count,
        }));
    }
  } catch (e) { console.warn('Franchise fetch failed:', e.message); }
  return [];
}

// ── Maturity check ────────────────────────────────────────────────────
function checkMaturity(tmdb, id) {
  if (tmdb?.isAdult) return true;
  if (tmdb?.rating === 'NC-17' || tmdb?.rating === 'R' || tmdb?.rating === 'TV-MA') return true;
  if (id?.contentWarning === 'adult') return true;
  return false;
}

// ── Build final response ──────────────────────────────────────────────
function buildResponse({ identification, tmdbData, omdbData, streaming, franchise, region, isAdult }) {
  const episode = identification?.episode
    ? (typeof identification.episode === 'number' ? `Episode ${identification.episode}` : String(identification.episode))
    : identification?.episodeInfo || null;

  return {
    title: tmdbData?.title || identification?.title || 'Unknown',
    originalTitle: identification?.originalTitle || null,
    year: tmdbData?.year || identification?.releaseYear || null,
    mediaType: tmdbData?.mediaType || identification?.mediaType || 'movie',
    confidence: identification?.confidence || 85,
    identifiedBy: identification?.source || 'ai',
    episode,
    poster: tmdbData?.poster || null,
    backdrop: tmdbData?.backdrop || null,
    synopsis: tmdbData?.synopsis || '',
    genres: tmdbData?.genres || [],
    director: tmdbData?.director || null,
    cast: tmdbData?.cast || [],
    runtime: tmdbData?.runtime || null,
    rating: tmdbData?.rating || omdbData?.rated || null,
    tmdbScore: tmdbData?.tmdbScore || null,
    imdbRating: omdbData?.imdbRating || null,
    imdbVotes: omdbData?.imdbVotes || null,
    imdbId: omdbData?.imdbId || null,
    awards: omdbData?.awards || null,
    boxOffice: omdbData?.boxOffice || null,
    streaming,
    franchise,
    region,
    isAdult,
    seasons: tmdbData?.seasons || null,
    episodes: tmdbData?.episodes || null,
    status: tmdbData?.status || null,
    productionCountries: tmdbData?.productionCountries || [],
  };
}

// ── Helpers ───────────────────────────────────────────────────────────
function base64ToBlob(base64, mimeType) {
  const binary = Buffer.from(base64, 'base64');
  return new Blob([binary], { type: mimeType });
}

function extractAnimeTitle(filename) {
  if (!filename) return 'Unknown Anime';
  return filename.replace(/\.[^.]+$/, '').replace(/[._-]/g, ' ').trim();
}

function mapRelation(r) {
  return { PREQUEL: 'PREQUEL', SEQUEL: 'SEQUEL', PARENT: 'PARENT STORY', SIDE_STORY: 'SIDE STORY' }[r] || r;
}

function getRating(detail, isMovie) {
  if (isMovie) {
    const us = detail.release_dates?.results?.find(r => r.iso_3166_1 === 'US');
    return us?.release_dates?.find(d => d.certification)?.certification || null;
  }
  const us = detail.content_ratings?.results?.find(r => r.iso_3166_1 === 'US');
  return us?.rating || null;
}
