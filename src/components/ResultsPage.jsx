import React, { useState, useEffect } from 'react';

/* ─── Platform brand colors ─────────────────────────────────────────── */
const PLATFORM_COLORS = {
  'Netflix':     '#e50914',
  'Max':         '#5822e4',
  'Prime Video': '#00a8e0',
  'Disney+':     '#1033d4',
  'Crunchyroll': '#f47521',
  'Funimation':  '#410099',
  'Hulu':        '#1ce783',
  'Apple TV+':   '#c8c8c8',
};

/* ─── Shared logo ───────────────────────────────────────────────────── */
function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <polygon points="12,2 22,20 2,20" fill="var(--accent)" />
        <polygon points="12,7 18,18 6,18" fill="var(--bg-void)" />
      </svg>
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 800,
        fontSize: 15, letterSpacing: '-0.03em', color: 'var(--text-primary)',
      }}>WhatSource</span>
    </div>
  );
}

/* ─── Relation badge ────────────────────────────────────────────────── */
function RelationBadge({ relation }) {
  const MAP = {
    'THIS TITLE': { bg: 'rgba(59,130,246,0.16)', border: 'rgba(59,130,246,0.45)', text: '#60a5fa' },
    'PREQUEL':    { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', text: 'var(--text-muted)' },
    'SEQUEL':     { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', text: 'var(--text-muted)' },
    'FINALE':     { bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.3)', text: '#f59e0b' },
    'START HERE': { bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.3)', text: '#10b981' },
  };
  const c = MAP[relation] || MAP['PREQUEL'];
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 8.5, letterSpacing: '0.13em',
      color: c.text, background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 99, padding: '3px 9px', display: 'inline-block',
      fontWeight: 500,
    }}>{relation}</span>
  );
}

/* ─── Franchise card ────────────────────────────────────────────────── */
function FranchiseCard({ item }) {
  const isCurrent = item.relation === 'THIS TITLE';
  const [h, setH] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        flexShrink: 0, width: 155, borderRadius: 14,
        border: `1.5px solid ${isCurrent
          ? 'rgba(59,130,246,0.6)'
          : h ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.07)'}`,
        background: isCurrent
          ? 'rgba(59,130,246,0.07)'
          : h ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.018)',
        boxShadow: isCurrent
          ? '0 0 50px rgba(59,130,246,0.18), 0 0 100px rgba(59,130,246,0.06)'
          : 'none',
        overflow: 'hidden', transition: 'all 0.25s ease',
        transform: isCurrent ? 'scale(1.05)' : h ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      {/* Poster thumbnail */}
      <div style={{
        width: '100%', height: 105,
        background: isCurrent
          ? 'linear-gradient(145deg, rgba(59,130,246,0.22) 0%, rgba(59,130,246,0.06) 100%)'
          : 'rgba(255,255,255,0.04)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {!imgErr && item.poster ? (
          <img
            src={item.poster}
            alt={item.title}
            onError={() => setImgErr(true)}
            style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              opacity: isCurrent ? 0.95 : 0.45,
              filter: isCurrent ? 'none' : 'grayscale(50%) brightness(0.8)',
              transition: 'opacity 0.3s',
            }}
          />
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke={isCurrent ? 'var(--accent)' : 'rgba(255,255,255,0.18)'}
            strokeWidth="1.4">
            <rect x="2" y="2" width="20" height="20" rx="2"/>
            <polygon points="10 8 16 12 10 16 10 8"/>
          </svg>
        )}
        {/* Bottom gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 45%, rgba(3,5,7,0.85) 100%)',
        }} />
        {/* "PLAYING" indicator for current */}
        {isCurrent && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--accent)',
            boxShadow: '0 0 10px var(--accent)',
            animation: 'pulse-opacity 1.5s ease-in-out infinite',
          }} />
        )}
      </div>

      {/* Card info */}
      <div style={{ padding: '12px 13px 14px' }}>
        <RelationBadge relation={item.relation} />
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5,
          letterSpacing: '-0.01em', lineHeight: 1.35,
          color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)',
          marginTop: 8,
        }}>{item.title}</div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.06em',
          color: 'var(--text-muted)', marginTop: 5,
        }}>{item.year} · {item.type}</div>
      </div>
    </div>
  );
}

/* ─── Streaming platform card ───────────────────────────────────────── */
function StreamCard({ platform }) {
  const [h, setH] = useState(false);
  const color = PLATFORM_COLORS[platform.name] || '#888';

  return (
    <a
      href={platform.available ? (platform.link || '#') : undefined}
      onClick={e => { if (!platform.available) e.preventDefault(); }}
      onMouseEnter={() => { if (platform.available) setH(true); }}
      onMouseLeave={() => setH(false)}
      style={{
        borderRadius: 14, textDecoration: 'none',
        border: platform.available
          ? h ? '1px solid rgba(16,185,129,0.5)' : '1px solid rgba(16,185,129,0.2)'
          : '1px solid rgba(255,255,255,0.05)',
        background: platform.available
          ? h ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.04)'
          : 'rgba(255,255,255,0.018)',
        padding: '18px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.22s ease',
        opacity: platform.available ? 1 : 0.42,
        cursor: platform.available ? 'pointer' : 'not-allowed',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        {/* Brand dot */}
        <div style={{
          width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
          background: platform.available ? color : 'rgba(255,255,255,0.15)',
          boxShadow: platform.available ? `0 0 10px ${color}88` : 'none',
        }} />
        <div>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
            letterSpacing: '-0.01em',
            color: platform.available ? 'var(--text-primary)' : 'var(--text-muted)',
          }}>{platform.name}</div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.09em', marginTop: 3,
            color: platform.available ? '#10b981' : 'var(--text-faint)',
          }}>{platform.available ? 'AVAILABLE IN YOUR REGION' : 'NOT AVAILABLE'}</div>
        </div>
      </div>
      {platform.available && (
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
          color: h ? 'var(--text-primary)' : 'var(--text-secondary)',
          transition: 'color 0.2s',
        }}>WATCH →</div>
      )}
    </a>
  );
}

/* ─── Meta pill ─────────────────────────────────────────────────────── */
function MetaPill({ label, accent }) {
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em',
      color: accent ? '#f59e0b' : 'var(--text-secondary)',
      background: accent ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.05)',
      border: `1px solid ${accent ? 'rgba(245,158,11,0.22)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 7, padding: '5px 12px', whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

/* ─── Main export ───────────────────────────────────────────────────── */
export default function ResultsPage({ result, preview, onReset }) {
  const [mounted, setMounted] = useState(false);
  const [posterErr, setPosterErr] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setTimeout(() => setMounted(true), 80);
  }, [result]);

  const available   = result.streaming?.filter(s => s.available)  || [];
  const unavailable = result.streaming?.filter(s => !s.available) || [];

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-void)', position: 'relative',
      opacity: mounted ? 1 : 0, transition: 'opacity 0.55s ease',
    }}>

      {/* ── STICKY NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        padding: '0 clamp(20px,4vw,64px)', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(3,5,7,0.9)', backdropFilter: 'blur(24px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Logo />
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '5px 12px', borderRadius: 99,
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.2)',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--accent)',
              boxShadow: '0 0 8px var(--accent)',
              animation: 'pulse-opacity 1.5s ease-in-out infinite',
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
              color: 'var(--accent)',
            }}>{result.confidence}% MATCH</span>
          </div>
        </div>

        <button
          onClick={onReset}
          style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em',
            color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 99,
            padding: '9px 22px', cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
        >← NEW SEARCH</button>
      </nav>

      {/* ── COLORED ACCENT BAR ── */}
      <div style={{
        height: 2,
        background: `linear-gradient(90deg, ${result.accentColor || 'var(--accent)'} 0%, transparent 60%)`,
        opacity: 0.8,
      }} />

      {/* ── HERO SECTION ── */}
      <div style={{
        background: `linear-gradient(180deg, ${(result.backdropColor || '#0a1628')}d0 0%, rgba(3,5,7,0) 100%)`,
        padding: `64px clamp(20px,4vw,80px) 72px`,
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle background glow */}
        <div style={{
          position: 'absolute', top: 0, left: '30%',
          width: '50%', height: '100%',
          background: `radial-gradient(ellipse at 50% 0%, ${result.accentColor || 'var(--accent)'}18 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'start' }}>

            {/* ── LEFT COLUMN ── */}
            <div>
              {/* Confidence badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 12,
                marginBottom: 30, padding: '10px 20px', borderRadius: 99,
                border: '1px solid rgba(59,130,246,0.32)',
                background: 'rgba(59,130,246,0.09)',
                animation: 'fadeInUp 0.5s ease both',
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)',
                  boxShadow: '0 0 12px var(--accent)',
                  animation: 'pulse-opacity 1.5s ease-in-out infinite',
                }} />
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 15, letterSpacing: '0.04em',
                  color: 'var(--accent)', fontWeight: 500,
                }}>{result.confidence}% MATCH</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.1em',
                  color: 'rgba(59,130,246,0.55)', paddingLeft: 6,
                  borderLeft: '1px solid rgba(59,130,246,0.25)',
                }}>HIGH CONFIDENCE</span>
              </div>

              {/* Title */}
              <h1 style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 'clamp(40px, 6.5vw, 86px)',
                letterSpacing: '-0.035em', lineHeight: 0.93,
                color: 'var(--text-primary)', marginBottom: 22,
                animation: 'fadeInUp 0.5s ease both', animationDelay: '0.07s',
              }}>{result.title}</h1>

              {/* Episode label for series */}
              {result.episode && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  marginBottom: 22, padding: '10px 16px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  animation: 'fadeInUp 0.5s ease both', animationDelay: '0.14s',
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="var(--accent)" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.04em',
                    color: 'var(--text-secondary)',
                  }}>{result.episode}</span>
                </div>
              )}

              {/* Meta row */}
              <div style={{
                display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8,
                marginBottom: 22,
                animation: 'fadeInUp 0.5s ease both', animationDelay: '0.18s',
              }}>
                {result.year     && <MetaPill label={result.year.toString()} />}
                {result.type     && <MetaPill label={result.type} />}
                {result.rating   && <MetaPill label={result.rating} />}
                {result.runtime  && <MetaPill label={result.runtime} />}
                {result.imdb     && <MetaPill label={`★  ${result.imdb}`} accent />}
              </div>

              {/* Genre tags */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28,
                animation: 'fadeInUp 0.5s ease both', animationDelay: '0.24s',
              }}>
                {result.genre?.map(g => (
                  <span key={g} style={{
                    fontFamily: 'var(--font-body)', fontSize: 13,
                    color: 'var(--text-secondary)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 99, padding: '5px 14px',
                  }}>{g}</span>
                ))}
              </div>

              {/* Synopsis */}
              <p style={{
                fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 15.5,
                color: 'var(--text-secondary)', lineHeight: 1.82, maxWidth: 620,
                animation: 'fadeInUp 0.5s ease both', animationDelay: '0.3s',
              }}>{result.synopsis}</p>

              {/* Director */}
              {result.director && (
                <div style={{
                  marginTop: 24, display: 'flex', alignItems: 'center', gap: 12,
                  animation: 'fadeInUp 0.5s ease both', animationDelay: '0.36s',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.12em',
                    color: 'var(--text-muted)', textTransform: 'uppercase',
                  }}>Directed by</span>
                  <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.1)' }} />
                  <span style={{
                    fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
                    color: 'var(--text-secondary)', letterSpacing: '-0.01em',
                  }}>{result.director}</span>
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN — POSTER ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-end' }}>

              {/* Poster */}
              <div style={{
                width: 188, height: 280, borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.1)',
                overflow: 'hidden', flexShrink: 0,
                boxShadow: '0 28px 72px rgba(0,0,0,0.7)',
                background: 'rgba(255,255,255,0.04)',
                animation: 'scale-in 0.55s ease both', animationDelay: '0.1s',
              }}>
                {!posterErr && result.poster ? (
                  <img
                    src={result.poster}
                    alt={result.title}
                    onError={() => setPosterErr(true)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 12,
                    background: `linear-gradient(145deg, ${result.backdropColor || '#0a1628'}, rgba(3,5,7,0.5))`,
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                      stroke="rgba(255,255,255,0.12)" strokeWidth="1.2">
                      <rect x="2" y="2" width="20" height="20" rx="2"/>
                      <polygon points="10 8 16 12 10 16 10 8"/>
                    </svg>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em',
                      color: 'rgba(255,255,255,0.12)',
                    }}>NO POSTER</span>
                  </div>
                )}
              </div>

              {/* Uploaded file preview */}
              {preview && (
                <div style={{
                  width: 188, borderRadius: 12, overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(255,255,255,0.03)',
                  animation: 'scale-in 0.55s ease both', animationDelay: '0.2s',
                }}>
                  <div style={{
                    padding: '7px 11px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    fontFamily: 'var(--font-mono)', fontSize: 8.5, letterSpacing: '0.12em',
                    color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)' }} />
                    YOUR UPLOAD
                  </div>
                  <img src={preview} alt="Uploaded" style={{
                    width: '100%', maxHeight: 110, objectFit: 'cover', display: 'block',
                    opacity: 0.65,
                  }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── FRANCHISE TIMELINE ── */}
      <section style={{
        padding: `72px clamp(20px,4vw,80px) 80px`,
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          {/* Section header */}
          <div style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            marginBottom: 40, flexWrap: 'wrap', gap: 16,
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.16em',
                color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 10,
              }}>Franchise Timeline</div>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: 'clamp(22px, 3vw, 34px)',
                letterSpacing: '-0.025em', color: 'var(--text-primary)', lineHeight: 1.1,
              }}>Complete Watch Order<br />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.7em', fontWeight: 500 }}>
                  Sorted by global release date · Direct narrative continuity only
                </span>
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {[
                { color: 'rgba(59,130,246,0.55)', label: 'Current title' },
                { color: 'rgba(16,185,129,0.55)', label: 'Start here' },
                { color: 'rgba(245,158,11,0.55)', label: 'Finale' },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, border: `1.5px solid ${color}`, background: `${color}30` }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline scroll container */}
          {result.franchise?.length > 0 ? (
            <div style={{
              display: 'flex', alignItems: 'center',
              overflowX: 'auto', paddingBottom: 16,
              gap: 0,
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255,255,255,0.08) transparent',
            }}>
              {result.franchise.map((item, i) => (
                <React.Fragment key={item.id}>
                  <FranchiseCard item={item} />
                  {i < result.franchise.length - 1 && (
                    <div style={{
                      flexShrink: 0, display: 'flex', alignItems: 'center',
                      padding: '0 10px',
                    }}>
                      <div style={{
                        width: 28, height: 1,
                        background: 'linear-gradient(90deg, rgba(59,130,246,0.2), rgba(59,130,246,0.08))',
                      }} />
                      <svg width="6" height="10" viewBox="0 0 6 10" fill="rgba(59,130,246,0.25)">
                        <polygon points="0,0 6,5 0,10"/>
                      </svg>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div style={{
              padding: '40px 32px', borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(255,255,255,0.01)',
              fontFamily: 'var(--font-body)', fontSize: 14,
              color: 'var(--text-muted)', textAlign: 'center',
            }}>
              This title has no direct prequels or sequels — it stands alone.
            </div>
          )}

          {/* Cameo filter notice */}
          <div style={{
            marginTop: 22, display: 'flex', alignItems: 'center', gap: 9,
            padding: '10px 14px', borderRadius: 8,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
            width: 'fit-content',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="var(--text-muted)" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.07em',
              color: 'var(--text-muted)',
            }}>
              Cameo filter active — crossovers, ensemble appearances & cameos excluded
            </span>
          </div>
        </div>
      </section>

      {/* ── STREAMING SECTION ── */}
      {result.streaming && (
        <section style={{
          padding: `72px clamp(20px,4vw,80px) 80px`,
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>

            {/* Header */}
            <div style={{ marginBottom: 36 }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.16em',
                color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 10,
              }}>Streaming Availability</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <h2 style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: 'clamp(22px,3vw,34px)',
                  letterSpacing: '-0.025em', color: 'var(--text-primary)',
                }}>Where to Watch</h2>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px',
                  borderRadius: 99, background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%', background: 'var(--success)',
                    animation: 'pulse-opacity 2s ease-in-out infinite',
                  }} />
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.1em',
                    color: 'var(--text-secondary)',
                  }}>GEO-DETECTED · AUTO REGION</span>
                </div>
                {available.length > 0 && (
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.08em',
                    color: '#10b981',
                  }}>{available.length} platform{available.length > 1 ? 's' : ''} available</div>
                )}
              </div>
            </div>

            {/* Platform grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(264px, 1fr))',
              gap: 12,
            }}>
              {[...available, ...unavailable].map((p, i) => (
                <StreamCard key={i} platform={p} />
              ))}
            </div>

            {/* No platforms warning */}
            {available.length === 0 && (
              <div style={{
                marginTop: 24, padding: '18px 22px', borderRadius: 12,
                border: '1px solid rgba(245,158,11,0.22)',
                background: 'rgba(245,158,11,0.05)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.6">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#f59e0b' }}>
                  No legal streaming found for your region. Consider a VPN or physical media.
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── CTA BAND ── */}
      <div style={{
        padding: `72px clamp(20px,4vw,80px)`,
        textAlign: 'center',
        background: 'rgba(255,255,255,0.007)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.16em',
          color: 'var(--text-muted)', marginBottom: 18, textTransform: 'uppercase',
        }}>2,847,391 scenes identified globally</div>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(26px,4vw,48px)',
          letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 14, lineHeight: 1.1,
        }}>
          Have another mystery scene?
        </h3>
        <p style={{
          fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 15,
          color: 'var(--text-muted)', marginBottom: 40,
        }}>
          WhatSource works on movies, anime, K-dramas, C-dramas, and 47 other content types.
        </p>
        <button
          onClick={onReset}
          style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
            letterSpacing: '-0.01em',
            color: 'var(--bg-void)', background: 'var(--accent)',
            border: 'none', borderRadius: 99,
            padding: '17px 48px', cursor: 'pointer', transition: 'all 0.22s ease',
            boxShadow: '0 0 40px rgba(59,130,246,0.35), 0 8px 32px rgba(59,130,246,0.3)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.04) translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 0 60px rgba(59,130,246,0.55), 0 12px 40px rgba(59,130,246,0.4)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
            e.currentTarget.style.boxShadow = '0 0 40px rgba(59,130,246,0.35), 0 8px 32px rgba(59,130,246,0.3)';
          }}
        >
          Analyze Another Scene
        </button>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '28px clamp(20px,4vw,64px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: 1280, margin: '0 auto',
      }}>
        <Logo />
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          color: 'var(--text-faint)', letterSpacing: '0.06em',
        }}>© 2025 · PROTOTYPE v0.1.0 · MOCK DATA</span>
      </footer>
    </div>
  );
}
