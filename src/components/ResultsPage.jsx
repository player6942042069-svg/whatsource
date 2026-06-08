import React, { useState, useEffect } from 'react';

const RELATION_STYLE = {
  'THIS TITLE':        { bg: 'rgba(255,229,0,0.12)',    border: 'rgba(255,229,0,0.5)',    text: 'var(--gold)' },
  'PREQUEL':           { bg: 'rgba(255,255,255,0.04)',   border: 'rgba(255,255,255,0.1)',  text: 'var(--text-2)' },
  'SEQUEL':            { bg: 'rgba(255,255,255,0.04)',   border: 'rgba(255,255,255,0.1)',  text: 'var(--text-2)' },
  'SEASON':            { bg: 'rgba(255,255,255,0.04)',   border: 'rgba(255,255,255,0.1)',  text: 'var(--text-2)' },
  'FINALE':            { bg: 'rgba(0,230,118,0.08)',     border: 'rgba(0,230,118,0.3)',    text: 'var(--green)' },
  'START HERE':        { bg: 'rgba(0,230,118,0.08)',     border: 'rgba(0,230,118,0.3)',    text: 'var(--green)' },
  'SPIN-OFF PREQUEL':  { bg: 'rgba(61,142,255,0.08)',   border: 'rgba(61,142,255,0.25)',  text: 'var(--blue)' },
  'SEQUEL FILM':       { bg: 'rgba(255,255,255,0.04)',   border: 'rgba(255,255,255,0.1)',  text: 'var(--text-2)' },
  'PART OF SERIES':    { bg: 'rgba(255,255,255,0.04)',   border: 'rgba(255,255,255,0.1)',  text: 'var(--text-2)' },
  'PART OF COLLECTION':{ bg: 'rgba(255,255,255,0.04)',   border: 'rgba(255,255,255,0.1)',  text: 'var(--text-2)' },
};

function rs(rel) { return RELATION_STYLE[rel] || RELATION_STYLE['SEQUEL']; }

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <svg width="20" height="20" viewBox="0 0 26 26" fill="none">
        <polygon points="13,1 25,24 1,24" fill="var(--gold)" />
        <polygon points="13,8 21,22 5,22" fill="var(--black)" />
      </svg>
      <span style={{ fontFamily: 'var(--fd)', fontWeight: 900, fontSize: 15, letterSpacing: '-0.03em', color: 'var(--white)' }}>WhatSource</span>
    </div>
  );
}

function RelBadge({ relation }) {
  const s = rs(relation);
  return (
    <span style={{
      fontFamily: 'var(--fm)', fontSize: 8.5, letterSpacing: '0.12em',
      color: s.text, background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: 'var(--r-full)', padding: '3px 9px', display: 'inline-block', fontWeight: 500,
    }}>{relation}</span>
  );
}

function FranchiseCard({ item }) {
  const isCurrent = item.relation === 'THIS TITLE';
  const [h, setH] = useState(false);
  const [err, setErr] = useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        flexShrink: 0, width: 150, borderRadius: 'var(--r-md)',
        border: `1.5px solid ${isCurrent ? 'rgba(255,229,0,0.6)' : h ? 'var(--border-2)' : 'var(--border)'}`,
        background: isCurrent ? 'rgba(255,229,0,0.05)' : h ? 'var(--surface2)' : 'var(--surface)',
        overflow: 'hidden',
        boxShadow: isCurrent ? '0 0 40px rgba(255,229,0,0.12)' : 'none',
        transition: 'all 0.22s var(--ease)',
        transform: isCurrent ? 'scale(1.04)' : h ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      <div style={{ height: 100, background: 'var(--surface3)', position: 'relative', overflow: 'hidden' }}>
        {item.poster && !err
          ? <img src={item.poster} alt={item.title} onError={() => setErr(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isCurrent ? 1 : 0.5, filter: isCurrent ? 'none' : 'grayscale(30%)' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--fd)', fontSize: 22, color: 'var(--surface3)', fontWeight: 900 }}>?</span>
            </div>
        }
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85) 100%)' }} />
        {isCurrent && (
          <div style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 0 10px var(--gold)', animation: 'pulse-ring 1.5s infinite' }} />
        )}
      </div>
      <div style={{ padding: '10px 12px 13px' }}>
        <RelBadge relation={item.relation} />
        <div style={{ fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 12, letterSpacing: '-0.01em', lineHeight: 1.35, color: isCurrent ? 'var(--white)' : 'var(--text-2)', marginTop: 7 }}>{item.title}</div>
        <div style={{ fontFamily: 'var(--fm)', fontSize: 9.5, color: 'var(--text-3)', marginTop: 4, letterSpacing: '0.05em' }}>
          {[item.year, item.episodes ? `${item.episodes} eps` : null].filter(Boolean).join(' · ')}
        </div>
      </div>
    </div>
  );
}

function StreamCard({ s }) {
  const [h, setH] = useState(false);
  return (
    <a href={s.url || '#'} target="_blank" rel="noopener noreferrer"
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 18px', borderRadius: 'var(--r-md)', textDecoration: 'none',
        border: `1px solid ${h ? 'rgba(0,230,118,0.4)' : 'rgba(0,230,118,0.18)'}`,
        background: h ? 'rgba(0,230,118,0.07)' : 'rgba(0,230,118,0.03)',
        transition: 'all 0.2s',
        cursor: s.url ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)', flexShrink: 0 }} />
        <div>
          <div style={{ fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em', color: 'var(--white)' }}>{s.name}</div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--green)', marginTop: 2 }}>
            {s.type === 'sub' ? 'SUBSCRIPTION' : s.type?.toUpperCase() || 'AVAILABLE'}
          </div>
        </div>
      </div>
      {s.url && <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: '0.1em', color: h ? 'var(--white)' : 'var(--text-2)', transition: 'color 0.2s' }}>WATCH →</div>}
    </a>
  );
}

/* ─── Age Gate ───────────────────────────────────────────────────── */
function AgeGate({ onProceed, onBack, title, mediaType }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--red)',
        borderRadius: 'var(--r-xl)', padding: '52px 48px', maxWidth: 460,
        textAlign: 'center', animation: 'pop-in 0.4s var(--ease) both',
        boxShadow: '0 0 80px rgba(255,61,61,0.15)',
      }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>🔞</div>
        <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--red)', marginBottom: 16 }}>
          18+ CONTENT WARNING
        </div>
        <div style={{ fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em', color: 'var(--white)', marginBottom: 12 }}>
          {title}
        </div>
        <div style={{ fontFamily: 'var(--fb)', fontWeight: 300, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 36 }}>
          This {mediaType || 'title'} contains mature content rated 18+.
          It may include explicit themes, nudity, or graphic content.
          You must be 18 or older to view these results.
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onBack}
            style={{
              flex: 1, padding: '14px', borderRadius: 'var(--r-md)',
              border: '1px solid var(--border-2)', color: 'var(--text-2)',
              fontFamily: 'var(--fb)', fontWeight: 500, fontSize: 14, transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-3)'; e.currentTarget.style.color = 'var(--white)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-2)'; }}
          >Go Back</button>
          <button
            onClick={onProceed}
            style={{
              flex: 1, padding: '14px', borderRadius: 'var(--r-md)',
              background: 'var(--red)', color: 'var(--white)',
              fontFamily: 'var(--fb)', fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
              border: '1px solid transparent',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#ff5555'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--red)'; }}
          >I am 18+ — Show Title</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ResultsPage ───────────────────────────────────────────── */
export default function ResultsPage({ result, preview, onReset }) {
  const [mounted,      setMounted]      = useState(false);
  const [gateCleared,  setGateCleared]  = useState(!result.isAdult);
  const [posterErr,    setPosterErr]    = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setTimeout(() => setMounted(true), 80);
  }, []);

  if (!gateCleared) {
    return (
      <AgeGate
        title={result.title}
        mediaType={result.mediaType}
        onProceed={() => setGateCleared(true)}
        onBack={onReset}
      />
    );
  }

  const available   = (result.streaming || []);
  const hasFranchise = result.franchise?.length > 1;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', opacity: mounted ? 1 : 0, transition: 'opacity 0.5s' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(20px,4vw,64px)', height: 60,
        background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <Logo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--gold)' }}>
            {result.confidence}% MATCH
          </div>
          <button
            onClick={onReset}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-2)'; }}
            style={{
              fontFamily: 'var(--fm)', fontSize: 11, letterSpacing: '0.08em',
              color: 'var(--text-2)', border: '1px solid var(--border-2)',
              borderRadius: 'var(--r-full)', padding: '8px 20px', transition: 'all 0.2s',
            }}
          >← NEW SEARCH</button>
        </div>
      </nav>

      {/* ── GOLD ACCENT LINE ── */}
      <div style={{ height: 2, background: `linear-gradient(90deg, var(--gold) 0%, transparent 60%)`, opacity: 0.7 }} />

      {/* ── HERO SECTION ── */}
      <div style={{
        padding: `56px clamp(20px,4vw,80px) 64px`,
        borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(180deg, rgba(255,229,0,0.03) 0%, transparent 100%)',
        maxWidth: 1440, margin: '0 auto',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'start' }}>

          {/* LEFT */}
          <div>
            {/* Confidence */}
            <div className="fade-up" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 28,
              padding: '10px 18px', borderRadius: 'var(--r-full)',
              border: '1px solid rgba(255,229,0,0.3)', background: 'rgba(255,229,0,0.07)',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 0 10px var(--gold)', animation: 'pulse-ring 1.5s infinite' }} />
              <span style={{ fontFamily: 'var(--fm)', fontSize: 14, letterSpacing: '0.04em', color: 'var(--gold)', fontWeight: 500 }}>{result.confidence}% MATCH</span>
              <span style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: '0.1em', color: 'rgba(255,229,0,0.45)', paddingLeft: 8, borderLeft: '1px solid rgba(255,229,0,0.2)' }}>
                VIA {(result.identifiedBy || 'ai').toUpperCase()}
              </span>
            </div>

            {/* Title */}
            <h1 className="fade-up d2" style={{
              fontFamily: 'var(--fd)', fontWeight: 900,
              fontSize: 'clamp(38px,6vw,82px)',
              letterSpacing: '-0.035em', lineHeight: 0.93,
              color: 'var(--white)', marginBottom: 20,
            }}>{result.title}</h1>

            {/* Original title */}
            {result.originalTitle && result.originalTitle !== result.title && (
              <div className="fade-up d3" style={{ fontFamily: 'var(--fb)', fontSize: 16, color: 'var(--text-2)', marginBottom: 16, fontStyle: 'italic' }}>
                {result.originalTitle}
              </div>
            )}

            {/* Episode */}
            {result.episode && (
              <div className="fade-up d3" style={{
                display: 'inline-flex', alignItems: 'center', gap: 9,
                marginBottom: 20, padding: '9px 14px', borderRadius: 'var(--r-sm)',
                background: 'var(--surface2)', border: '1px solid var(--border)',
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                <span style={{ fontFamily: 'var(--fm)', fontSize: 11, letterSpacing: '0.04em', color: 'var(--text-2)' }}>{result.episode}</span>
              </div>
            )}

            {/* Meta pills */}
            <div className="fade-up d3" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {[
                result.year && String(result.year),
                result.mediaType === 'movie' ? 'Movie' : result.mediaType === 'anime' ? 'Anime' : 'TV Series',
                result.rating,
                result.runtime,
                result.seasons && `${result.seasons} Seasons`,
                result.status,
              ].filter(Boolean).map((v, i) => (
                <span key={i} style={{ fontFamily: 'var(--fm)', fontSize: 10.5, letterSpacing: '0.07em', color: 'var(--text-2)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--r-xs)', padding: '5px 11px' }}>{v}</span>
              ))}
              {(result.tmdbScore || result.imdbRating) && (
                <span style={{ fontFamily: 'var(--fm)', fontSize: 10.5, letterSpacing: '0.07em', color: 'var(--gold)', background: 'var(--gold-dim)', border: '1px solid rgba(255,229,0,0.2)', borderRadius: 'var(--r-xs)', padding: '5px 11px' }}>
                  ★ {result.imdbRating || result.tmdbScore}
                </span>
              )}
              {result.isAdult && (
                <span style={{ fontFamily: 'var(--fm)', fontSize: 10.5, letterSpacing: '0.07em', color: 'var(--red)', background: 'var(--red-dim)', border: '1px solid rgba(255,61,61,0.3)', borderRadius: 'var(--r-xs)', padding: '5px 11px' }}>18+</span>
              )}
            </div>

            {/* Genres */}
            {result.genres?.length > 0 && (
              <div className="fade-up d4" style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 24 }}>
                {result.genres.map(g => (
                  <span key={g} style={{ fontFamily: 'var(--fb)', fontSize: 12, color: 'var(--text-2)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', padding: '4px 13px' }}>{g}</span>
                ))}
              </div>
            )}

            {/* Synopsis */}
            {result.synopsis && (
              <p className="fade-up d5" style={{ fontFamily: 'var(--fb)', fontWeight: 300, fontSize: 15, color: 'var(--text-2)', lineHeight: 1.82, maxWidth: 620 }}>{result.synopsis}</p>
            )}

            {/* Director + Countries */}
            <div className="fade-up d6" style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 24 }}>
              {result.director && (
                <div>
                  <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-3)', marginBottom: 4 }}>DIRECTED BY</div>
                  <div style={{ fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{result.director}</div>
                </div>
              )}
              {result.productionCountries?.length > 0 && (
                <div>
                  <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-3)', marginBottom: 4 }}>COUNTRY</div>
                  <div style={{ fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{result.productionCountries.slice(0, 2).join(', ')}</div>
                </div>
              )}
              {result.region && (
                <div>
                  <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-3)', marginBottom: 4 }}>YOUR REGION</div>
                  <div style={{ fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{result.region}</div>
                </div>
              )}
              {result.awards && result.awards !== 'N/A' && (
                <div>
                  <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-3)', marginBottom: 4 }}>AWARDS</div>
                  <div style={{ fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 13, color: 'var(--gold)', maxWidth: 260 }}>{result.awards}</div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Poster */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-end' }}>
            <div className="scale-up" style={{ width: 190, height: 285, borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--border-2)', background: 'var(--surface)', boxShadow: '0 28px 72px rgba(0,0,0,0.7)', flexShrink: 0 }}>
              {result.poster && !posterErr
                ? <img src={result.poster} alt={result.title} onError={() => setPosterErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--fd)', fontSize: 36, color: 'var(--surface3)', fontWeight: 900 }}>WS</span>
                    <span style={{ fontFamily: 'var(--fm)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em' }}>NO POSTER</span>
                  </div>
              }
            </div>
            {preview && (
              <div style={{ width: 190, borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface)' }}>
                <div style={{ padding: '6px 10px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--fm)', fontSize: 8.5, letterSpacing: '0.12em', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--gold)' }} />
                  YOUR UPLOAD
                </div>
                <img src={preview} alt="Uploaded" style={{ width: '100%', maxHeight: 105, objectFit: 'cover', opacity: 0.65 }} />
              </div>
            )}
          </div>
        </div>

        {/* Cast */}
        {result.cast?.length > 0 && (
          <div style={{ marginTop: 48, paddingTop: 40, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: '0.16em', color: 'var(--text-3)', marginBottom: 18 }}>CAST</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {result.cast.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: 'var(--surface3)', border: '1px solid var(--border)', flexShrink: 0 }}>
                    {c.photo ? <img src={c.photo} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--fd)', fontSize: 12, color: 'var(--text-3)', fontWeight: 700 }}>{c.name?.[0]}</div>}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--fb)', fontWeight: 500, fontSize: 13, color: 'var(--text)' }}>{c.name}</div>
                    {c.character && <div style={{ fontFamily: 'var(--fm)', fontSize: 9.5, color: 'var(--text-3)', marginTop: 1 }}>{c.character}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── FRANCHISE TIMELINE ── */}
      {hasFranchise && (
        <section style={{ padding: `64px clamp(20px,4vw,80px)`, borderBottom: '1px solid var(--border)', maxWidth: 1440, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: '0.18em', color: 'var(--gold)', marginBottom: 10 }}>FRANCHISE TIMELINE</div>
              <h2 style={{ fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 'clamp(20px,3vw,32px)', letterSpacing: '-0.025em', color: 'var(--white)', lineHeight: 1.1 }}>
                Complete Watch Order<br />
                <span style={{ color: 'var(--text-2)', fontSize: '0.65em', fontWeight: 500 }}>Release date order · Direct continuity only</span>
              </h2>
            </div>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: '0.08em', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 10, height: 10, border: '1.5px solid rgba(255,229,0,0.5)', borderRadius: 3, background: 'rgba(255,229,0,0.1)' }} />
              = CURRENT TITLE
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', paddingBottom: 8, gap: 0 }}>
            {result.franchise.map((item, i) => (
              <React.Fragment key={i}>
                <FranchiseCard item={item} />
                {i < result.franchise.length - 1 && (
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                    <div style={{ width: 24, height: 1, background: 'rgba(255,229,0,0.2)' }} />
                    <svg width="5" height="8" viewBox="0 0 5 8" fill="rgba(255,229,0,0.3)"><polygon points="0,0 5,4 0,8"/></svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', width: 'fit-content' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: '0.07em', color: 'var(--text-3)' }}>Cameo filter active — crossovers and ensemble appearances excluded</span>
          </div>
        </section>
      )}

      {/* ── STREAMING ── */}
      <section style={{ padding: `64px clamp(20px,4vw,80px)`, borderBottom: '1px solid var(--border)', maxWidth: 1440, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: '0.18em', color: 'var(--gold)', marginBottom: 10 }}>STREAMING AVAILABILITY</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          <h2 style={{ fontFamily: 'var(--fd)', fontWeight: 700, fontSize: 'clamp(20px,3vw,32px)', letterSpacing: '-0.025em', color: 'var(--white)' }}>Where to Watch</h2>
          {result.region && (
            <span style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--text-2)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', padding: '5px 12px' }}>
              📍 {result.region}
            </span>
          )}
        </div>

        {available.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
            {available.map((s, i) => <StreamCard key={i} s={s} />)}
          </div>
        ) : (
          <div style={{ padding: '32px', borderRadius: 'var(--r-lg)', border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.04)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.6"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span style={{ fontFamily: 'var(--fb)', fontSize: 14, color: '#f59e0b' }}>
              No legal streaming found for your region ({result.region}). Try a VPN or check physical media.
            </span>
          </div>
        )}
      </section>

      {/* ── CTA ── */}
      <div style={{ padding: `72px clamp(20px,4vw,80px)`, textAlign: 'center', maxWidth: 1440, margin: '0 auto' }}>
        <h3 style={{ fontFamily: 'var(--fd)', fontWeight: 900, fontSize: 'clamp(24px,4vw,46px)', letterSpacing: '-0.03em', color: 'var(--white)', marginBottom: 14 }}>Have another mystery scene?</h3>
        <p style={{ fontFamily: 'var(--fb)', fontWeight: 300, fontSize: 15, color: 'var(--text-2)', marginBottom: 40 }}>WhatSource identifies any content from anywhere in the world.</p>
        <button
          onClick={onReset}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--white)'; e.currentTarget.style.color = 'var(--black)'; e.currentTarget.style.transform = 'scale(1.04) translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = 'var(--black)'; e.currentTarget.style.transform = 'scale(1) translateY(0)'; }}
          style={{ fontFamily: 'var(--fd)', fontWeight: 900, fontSize: 15, letterSpacing: '-0.01em', color: 'var(--black)', background: 'var(--gold)', border: 'none', borderRadius: 'var(--r-full)', padding: '18px 52px', cursor: 'pointer', transition: 'all 0.22s var(--ease)', boxShadow: '0 0 40px rgba(255,229,0,0.3)' }}
        >ANALYZE ANOTHER SCENE</button>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px clamp(20px,4vw,64px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1440, margin: '0 auto' }}>
        <Logo />
        <span style={{ fontFamily: 'var(--fm)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em' }}>© 2025 WhatSource · Data from TMDB · AniList · OMDb</span>
      </footer>
    </div>
  );
}
