// api/search.js — WhatSource text search endpoint

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).json({});
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.status(400).json({ error: 'Query too short' });

  try {
    // Run all searches in parallel
    const [tmdb, anilist, jikan, tvmaze] = await Promise.allSettled([
      searchTMDB(q),
      searchAniList(q),
      searchJikan(q),
      searchTVMaze(q),
    ]);

    // Merge and deduplicate
    const results = mergeResults(
      tmdb.status === 'fulfilled' ? tmdb.value : [],
      anilist.status === 'fulfilled' ? anilist.value : [],
      jikan.status === 'fulfilled' ? jikan.value : [],
      tvmaze.status === 'fulfilled' ? tvmaze.value : [],
    );

    return res.status(200).json({ success: true, results: results.slice(0, 12) });
  } catch (err) {
    console.error('Search error:', err);
    return res.status(500).json({ error: 'Search failed' });
  }
}

// ── TMDB multi-search ─────────────────────────────────────────────────
async function searchTMDB(query) {
  const key = process.env.TMDB_API_KEY;
  const r = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${key}&query=${encodeURIComponent(query)}&include_adult=true&language=en-US&page=1`);
  const d = await r.json();
  return (d.results || [])
    .filter(x => x.media_type !== 'person' && (x.title || x.name))
    .slice(0, 8)
    .map(x => ({
      id: `tmdb-${x.id}`,
      _tmdbId: x.id,
      _mediaType: x.media_type === 'movie' ? 'movie' : 'tv',
      title: x.title || x.name,
      year: parseInt((x.release_date || x.first_air_date || '0').slice(0, 4)) || null,
      type: x.media_type === 'movie' ? 'Movie' : 'TV Series',
      poster: x.poster_path ? `https://image.tmdb.org/t/p/w200${x.poster_path}` : null,
      overview: x.overview?.slice(0, 180) || '',
      score: x.vote_average?.toFixed(1) || null,
      popularity: x.popularity || 0,
      isAdult: x.adult || false,
      _source: 'tmdb',
    }));
}

// ── AniList GraphQL search ────────────────────────────────────────────
async function searchAniList(query) {
  const gql = `query($s:String){Page(perPage:5){media(search:$s,type:ANIME,sort:POPULARITY_DESC){id title{english romaji} coverImage{medium} startDate{year} genres averageScore episodes format isAdult}}}`;
  const r = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: gql, variables: { s: query } }),
  });
  const d = await r.json();
  return (d.data?.Page?.media || []).map(m => ({
    id: `anilist-${m.id}`,
    _anilistId: m.id,
    _mediaType: 'anime',
    title: m.title?.english || m.title?.romaji || 'Unknown',
    year: m.startDate?.year || null,
    type: fmtAniFormat(m.format),
    poster: m.coverImage?.medium || null,
    overview: m.genres?.join(', ') || '',
    score: m.averageScore ? (m.averageScore / 10).toFixed(1) : null,
    popularity: m.averageScore || 0,
    isAdult: m.isAdult || false,
    _source: 'anilist',
  }));
}

// ── Jikan (MyAnimeList) search ────────────────────────────────────────
async function searchJikan(query) {
  await new Promise(r => setTimeout(r, 300)); // rate limit buffer
  const r = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=4&order_by=popularity&sort=asc`);
  const d = await r.json();
  return (d.data || []).map(m => ({
    id: `jikan-${m.mal_id}`,
    _malId: m.mal_id,
    _mediaType: 'anime',
    title: m.title_english || m.title || 'Unknown',
    year: m.year || null,
    type: m.type === 'Movie' ? 'Anime Film' : 'Anime Series',
    poster: m.images?.jpg?.image_url || null,
    overview: m.synopsis?.slice(0, 180) || '',
    score: m.score?.toFixed(1) || null,
    popularity: m.popularity || 999,
    isAdult: m.rating?.includes('Rx') || false,
    _source: 'jikan',
  }));
}

// ── TVMaze search ─────────────────────────────────────────────────────
async function searchTVMaze(query) {
  const r = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
  const d = await r.json();
  return (d || []).slice(0, 4).map(item => ({
    id: `tvmaze-${item.show.id}`,
    _tvmazeId: item.show.id,
    _mediaType: 'tv',
    title: item.show.name,
    year: item.show.premiered ? parseInt(item.show.premiered.slice(0, 4)) : null,
    type: item.show.type || 'TV Series',
    poster: item.show.image?.medium || null,
    overview: (item.show.summary || '').replace(/<[^>]*>/g, '').slice(0, 180),
    score: item.show.rating?.average?.toFixed(1) || null,
    popularity: item.score || 0,
    isAdult: false,
    _source: 'tvmaze',
  }));
}

// ── Merge + deduplicate ───────────────────────────────────────────────
function mergeResults(...arrays) {
  const all = arrays.flat();
  const seen = new Map();
  for (const item of all) {
    const key = item.title?.toLowerCase().trim();
    if (!key) continue;
    const existing = seen.get(key);
    // Prefer TMDB > AniList > Jikan > TVMaze; higher score wins ties
    if (!existing || sourcePriority(item._source) > sourcePriority(existing._source)) {
      seen.set(key, item);
    }
  }
  return [...seen.values()].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
}

function sourcePriority(s) {
  return { tmdb: 4, anilist: 3, jikan: 2, tvmaze: 1 }[s] || 0;
}

function fmtAniFormat(f) {
  return { TV: 'Anime Series', MOVIE: 'Anime Film', OVA: 'OVA', SPECIAL: 'Special', TV_SHORT: 'Anime Short' }[f] || 'Anime';
}
