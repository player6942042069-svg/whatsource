import React, { useState, useRef, useCallback, useEffect } from 'react';

/* ─── Tiny reusable pieces ───────────────────────────────────────── */
function Logo({ size = 'md' }) {
  const s = size === 'sm' ? { tri: 18, text: 13 } : { tri: 26, text: 18 };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={s.tri} height={s.tri} viewBox="0 0 26 26" fill="none">
        <polygon points="13,1 25,24 1,24" fill="var(--gold)" />
        <polygon points="13,8 21,22 5,22"  fill="var(--black)" />
      </svg>
      <span style={{ fontFamily: 'var(--fd)', fontWeight: 900, fontSize: s.text, letterSpacing: '-0.03em', color: 'var(--white)' }}>
        WhatSource
      </span>
    </div>
  );
}

function Pill({ children, color = 'default' }) {
  const styles = {
    default: { bg: 'var(--surface2)', border: 'var(--border)',   text: 'var(--text-2)' },
    gold:    { bg: 'var(--gold-dim)', border: 'var(--gold-glow)', text: 'var(--gold)'   },
    green:   { bg: 'var(--green-dim)',border: 'rgba(0,230,118,0.25)', text: 'var(--green)' },
  }[color];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: 'var(--r-full)',
      background: styles.bg, border: `1px solid ${styles.border}`,
      fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: '0.12em',
      color: styles.text, whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

/* ─── Live Search ────────────────────────────────────────────────── */
function LiveSearch({ onResult }) {
  const [q, setQ]           = useState('');
  const [results, setRes]   = useState([]);
  const [loading, setLoad]  = useState(false);
  const [open, setOpen]     = useState(false);
  const debounce            = useRef(null);
  const wrapRef             = useRef(null);

  const search = useCallback(async (val) => {
    if (val.trim().length < 2) { setRes([]); setOpen(false); return; }
    setLoad(true);
    try {
      const r = await fetch(`/api/search?q=${encodeURIComponent(val.trim())}`);
      const d = await r.json();
      setRes(d.results || []);
      setOpen(true);
    } catch { setRes([]); }
    finally { setLoad(false); }
  }, []);

  const onChange = (e) => {
    const val = e.target.value;
    setQ(val);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => search(val), 380);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const mediaTypeLabel = (t) => {
    if (t === 'movie') return 'Movie';
    if (t === 'anime') return 'Anime';
    return 'Series';
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>
      {/* Input row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        background: 'var(--surface)', border: '1px solid var(--border-2)',
        borderRadius: 'var(--r-md)', overflow: 'hidden',
        transition: 'border-color 0.2s',
        ...(open ? { borderColor: 'var(--gold)', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 } : {}),
      }}>
        <div style={{ padding: '0 14px', color: 'var(--text-3)', flexShrink: 0 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <input
          type="text"
          value={q}
          onChange={onChange}
          onFocus={() => results.length && setOpen(true)}
          placeholder="Search any movie, anime, K-drama, series..."
          style={{
            flex: 1, padding: '14px 0', fontSize: 14, fontWeight: 400,
            color: 'var(--text)', background: 'transparent',
          }}
        />
        {loading && (
          <div style={{ padding: '0 14px', flexShrink: 0 }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--border-2)', borderTopColor: 'var(--gold)', animation: 'spin 0.8s linear infinite' }} />
          </div>
        )}
        {q && !loading && (
          <button onClick={() => { setQ(''); setRes([]); setOpen(false); }}
            style={{ padding: '0 14px', color: 'var(--text-3)', fontSize: 18, lineHeight: 1 }}>×</button>
        )}
      </div>

      {/* Results dropdown */}
      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 500,
          background: 'var(--surface)', border: '1px solid var(--gold)',
          borderTop: 'none', borderBottomLeftRadius: 'var(--r-md)', borderBottomRightRadius: 'var(--r-md)',
          maxHeight: 360, overflowY: 'auto',
          boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
        }}>
          {results.map((item, i) => (
            <SearchResultRow key={item.id || i} item={item} onClick={() => { setOpen(false); setQ(item.title); onResult(item); }} />
          ))}
        </div>
      )}

      {open && !loading && q.length >= 2 && results.length === 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 500,
          background: 'var(--surface)', border: '1px solid var(--border-2)',
          borderTop: 'none', borderBottomLeftRadius: 'var(--r-md)', borderBottomRightRadius: 'var(--r-md)',
          padding: '20px', textAlign: 'center',
          fontFamily: 'var(--fm)', fontSize: 12, color: 'var(--text-3)',
        }}>
          No results found for "{q}"
        </div>
      )}
    </div>
  );
}

function SearchResultRow({ item, onClick }) {
  const [h, setH] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 14px', cursor: 'pointer',
        background: h ? 'rgba(255,229,0,0.04)' : 'transparent',
        borderBottom: '1px solid var(--border)',
        transition: 'background 0.15s',
      }}
    >
      <div style={{ width: 36, height: 52, borderRadius: 4, overflow: 'hidden', flexShrink: 0, background: 'var(--surface3)' }}>
        {item.poster && !imgErr
          ? <img src={item.poster} alt="" onError={() => setImgErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 16 }}>?</div>
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: h ? 'var(--gold)' : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'color 0.15s' }}>
          {item.title}
        </div>
        <div style={{ fontFamily: 'var(--fm)', fontSize: 10, color: 'var(--text-3)', marginTop: 3, letterSpacing: '0.08em' }}>
          {[item.type, item.year].filter(Boolean).join(' · ')}
          {item.isAdult && <span style={{ marginLeft: 6, color: 'var(--red)', fontWeight: 600 }}>18+</span>}
        </div>
      </div>
      {item.score && (
        <span style={{ fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--gold)', flexShrink: 0 }}>★ {item.score}</span>
      )}
    </div>
  );
}

/* ─── Upload Zone ────────────────────────────────────────────────── */
function UploadZone({ onFile }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return;
    onFile(file);
  }, [onFile]);

  const onDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDrag(false);
    handleFile(e.dataTransfer.files?.[0]);
  };
  const onDragOver  = (e) => { e.preventDefault(); e.stopPropagation(); setDrag(true); };
  const onDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setDrag(false); };
  const onDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setDrag(true); };

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDragEnter={onDragEnter}
      onClick={() => inputRef.current?.click()}
      style={{
        position: 'relative',
        border: `2px dashed ${drag ? 'var(--gold)' : 'rgba(255,255,255,0.14)'}`,
        borderRadius: 'var(--r-lg)',
        padding: '44px 32px',
        textAlign: 'center',
        cursor: 'pointer',
        background: drag ? 'rgba(255,229,0,0.04)' : 'rgba(255,255,255,0.015)',
        transition: 'all 0.25s var(--ease)',
        boxShadow: drag ? '0 0 60px rgba(255,229,0,0.08)' : 'none',
      }}
    >
      {/* Corner accents */}
      {[
        { top: -2, left: -2,   borderTop: '2px solid var(--gold)', borderLeft: '2px solid var(--gold)' },
        { top: -2, right: -2,  borderTop: '2px solid var(--gold)', borderRight: '2px solid var(--gold)' },
        { bottom: -2, left: -2,  borderBottom: '2px solid var(--gold)', borderLeft: '2px solid var(--gold)' },
        { bottom: -2, right: -2, borderBottom: '2px solid var(--gold)', borderRight: '2px solid var(--gold)' },
      ].map((s, i) => (
        <div key={i} style={{ position: 'absolute', width: 20, height: 20, opacity: drag ? 1 : 0.4, transition: 'opacity 0.25s', ...s }} />
      ))}

      <div style={{ animation: 'float-up 3.5s ease-in-out infinite' }}>
        <div style={{
          width: 64, height: 64, margin: '0 auto 20px',
          borderRadius: '50%',
          background: drag ? 'rgba(255,229,0,0.12)' : 'var(--surface2)',
          border: `1px solid ${drag ? 'rgba(255,229,0,0.3)' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.25s',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke={drag ? 'var(--gold)' : 'var(--text-2)'} strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      <div style={{ fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', color: drag ? 'var(--gold)' : 'var(--text)', marginBottom: 8, transition: 'color 0.25s' }}>
        {drag ? 'Release to analyze' : 'Drop your file here'}
      </div>
      <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: 22 }}>
        PNG · JPG · WEBP · MP4 · MOV · UP TO 50MB
      </div>

      <button
        onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = 'var(--black)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gold)'; }}
        style={{
          fontFamily: 'var(--fm)', fontSize: 11, letterSpacing: '0.1em',
          color: 'var(--gold)', background: 'transparent',
          border: '1px solid var(--gold)', borderRadius: 'var(--r-full)',
          padding: '10px 28px', transition: 'all 0.2s',
        }}
      >BROWSE FILES</button>

      <input ref={inputRef} type="file" accept="image/*,video/mp4,video/quicktime,video/webm"
        onChange={e => handleFile(e.target.files?.[0])}
        style={{ display: 'none' }} />
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function LandingPage({ onVisualUpload, onSearchResult, error, onClearError }) {
  const [tab, setTab]     = useState('upload'); // 'upload' | 'paste' | 'search'
  const [visible, setVis] = useState(false);
  const [counter, setCtr] = useState(0);

  useEffect(() => {
    setTimeout(() => setVis(true), 60);
    // Animate counter
    const target = 3194827, dur = 2600, start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 4);
      setCtr(Math.floor(e * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    const t = setTimeout(() => requestAnimationFrame(tick), 800);
    return () => clearTimeout(t);
  }, []);

  const steps = [
    { n: '01', title: 'Upload', desc: 'Drop a screenshot, paste from clipboard (Ctrl+V), or type the title. Works with cropped, mirrored, and compressed media.' },
    { n: '02', title: 'Identify', desc: 'Trace.moe handles anime scenes. Gemini Vision handles all live-action. Both run in parallel for maximum accuracy.' },
    { n: '03', title: 'Discover', desc: 'Get real metadata, cast, ratings, the full franchise timeline, and every streaming platform available in your country.' },
  ];

  const supported = ['Hollywood', 'Anime', 'K-Drama', 'C-Drama', 'J-Drama', 'Bollywood', 'Turkish Dizi', 'Filipino Series', 'Thai Drama', 'African Cinema', 'European Film', 'Latin Telenovela', 'Donghua', 'OVA & Specials', 'Mini-Series', 'Documentary'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', opacity: visible ? 1 : 0, transition: 'opacity 0.5s' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', inset: '0 0 auto', zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(20px,4vw,64px)', height: 60,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <Logo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', animation: 'pulse-ring 2s ease-in-out infinite' }} />
          <span style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-2)' }}>LIVE</span>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{
        minHeight: '100vh', paddingTop: 60,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        maxWidth: 1440, margin: '0 auto',
        padding: '0 clamp(20px,4vw,80px)',
        gap: 48, alignItems: 'center',
      }}>

        {/* LEFT — Headline */}
        <div style={{ paddingTop: 40 }}>
          <div className="fade-up d1" style={{ marginBottom: 24 }}>
            <Pill color="gold">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />
              VISUAL MEDIA IDENTIFICATION
            </Pill>
          </div>

          <h1 className="display-xl fade-up d2" style={{ color: 'var(--white)', marginBottom: 10 }}>
            IDENTIFY
          </h1>
          <h1 className="display-xl fade-up d3" style={{ color: 'var(--text-2)', marginBottom: 10 }}>
            ANY SCENE
          </h1>
          <h1 className="display-xl fade-up d4" style={{ color: 'var(--white)' }}>
            INSTANTLY<span style={{ color: 'var(--gold)' }}>.</span>
          </h1>

          <p className="fade-up d5" style={{
            fontFamily: 'var(--fb)', fontWeight: 300, fontSize: 'clamp(14px,1.5vw,17px)',
            color: 'var(--text-2)', lineHeight: 1.8, maxWidth: 480, marginTop: 32, marginBottom: 40,
          }}>
            Upload a screenshot, paste from clipboard, or type the title.
            WhatSource identifies any movie, anime, K-drama, or series from
            anywhere in the world — then shows you exactly where to stream it.
          </p>

          {/* Stats */}
          <div className="fade-up d6" style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
            <Stat value={counter.toLocaleString()} label="Scenes Identified" />
            <div style={{ width: 1, background: 'var(--border)' }} />
            <Stat value="190+" label="Countries" />
            <div style={{ width: 1, background: 'var(--border)' }} />
            <Stat value="16" label="Content Types" />
          </div>
        </div>

        {/* RIGHT — Input Card */}
        <div className="scale-up d3" style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-2)',
          borderRadius: 'var(--r-xl)',
          padding: 28,
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        }}>
          {/* Error banner */}
          {error && (
            <div style={{
              marginBottom: 16, padding: '12px 16px', borderRadius: 'var(--r-sm)',
              background: 'var(--red-dim)', border: '1px solid rgba(255,61,61,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            }}>
              <span style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--red)' }}>{error}</span>
              <button onClick={onClearError} style={{ color: 'var(--red)', fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
          )}

          {/* Paste hint banner */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 'var(--r-sm)',
            background: 'var(--gold-dim)', border: '1px solid rgba(255,229,0,0.15)',
            marginBottom: 20,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
              <rect x="9" y="2" width="6" height="4" rx="1"/><path d="M6 6h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z"/>
            </svg>
            <span style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--gold)' }}>
              CTRL+V ANYWHERE ON THIS PAGE TO PASTE A SCREENSHOT
            </span>
          </div>

          {/* Input Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--surface2)', borderRadius: 'var(--r-sm)', padding: 4 }}>
            {[['upload', '↑ Upload'], ['search', '⌕ Search']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  flex: 1, padding: '9px 0',
                  fontFamily: 'var(--fm)', fontSize: 11, letterSpacing: '0.08em',
                  borderRadius: 'var(--r-xs)',
                  color: tab === key ? 'var(--black)' : 'var(--text-2)',
                  background: tab === key ? 'var(--gold)' : 'transparent',
                  transition: 'all 0.2s',
                  fontWeight: tab === key ? 600 : 400,
                }}
              >{label}</button>
            ))}
          </div>

          {/* Upload Pane */}
          {tab === 'upload' && <UploadZone onFile={onVisualUpload} />}

          {/* Search Pane */}
          {tab === 'search' && (
            <div>
              <LiveSearch onResult={onSearchResult} />
              <div style={{ marginTop: 14, fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--text-3)', textAlign: 'center' }}>
                Searches TMDB · AniList · Jikan · TVMaze in real time
              </div>
            </div>
          )}

          {/* Supported types */}
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-3)', marginBottom: 10 }}>SUPPORTED CONTENT</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {supported.map(t => (
                <span key={t} style={{
                  fontFamily: 'var(--fb)', fontSize: 11,
                  color: 'var(--text-2)', background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-full)', padding: '3px 10px',
                }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section style={{ maxWidth: 1440, margin: '0 auto', padding: 'clamp(60px,8vw,120px) clamp(20px,4vw,80px)' }}>
        <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--gold)', marginBottom: 20, textTransform: 'uppercase' }}>HOW IT WORKS</div>
        <h2 className="display-lg" style={{ color: 'var(--white)', marginBottom: 60 }}>
          Three steps.<br />
          <span style={{ color: 'var(--text-2)' }}>One answer.</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {steps.map((s, i) => <StepCard key={i} {...s} />)}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px clamp(20px,4vw,64px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1440, margin: '0 auto' }}>
        <Logo size="sm" />
        <span style={{ fontFamily: 'var(--fm)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em' }}>
          © 2025 WhatSource · Powered by Gemini · TMDB · Trace.moe · AniList
        </span>
      </footer>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--fd)', fontWeight: 900, fontSize: 'clamp(22px,3vw,36px)', letterSpacing: '-0.03em', color: 'var(--white)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-3)', marginTop: 5, textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

function StepCard({ n, title, desc }) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        padding: '36px 32px',
        border: `1px solid ${h ? 'var(--gold)' : 'var(--border)'}`,
        borderRadius: 'var(--r-lg)',
        background: h ? 'rgba(255,229,0,0.03)' : 'var(--surface)',
        transition: 'all 0.25s var(--ease)',
        transform: h ? 'translateY(-4px)' : 'none',
      }}
    >
      <div style={{ fontFamily: 'var(--fm)', fontSize: 40, fontWeight: 400, color: h ? 'rgba(255,229,0,0.12)' : 'rgba(255,255,255,0.05)', lineHeight: 1, marginBottom: 28 }}>{n}</div>
      <div style={{ fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em', color: 'var(--white)', marginBottom: 12 }}>{title}</div>
      <div style={{ fontFamily: 'var(--fb)', fontWeight: 300, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.75 }}>{desc}</div>
    </div>
  );
}
