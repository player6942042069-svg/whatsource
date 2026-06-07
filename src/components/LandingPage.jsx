import React, { useState, useRef, useCallback, useEffect } from 'react';
import { globalSearchCount } from '../data/mockResults.js';

/* ─── Shared tiny helpers ──────────────────────────────────────────── */
function Logo({ size = 24, opacity = 1 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <polygon points="12,2 22,20 2,20" fill="var(--accent)" />
        <polygon points="12,7 18,18 6,18" fill="var(--bg-void)" />
      </svg>
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 800,
        fontSize: size * 0.75, letterSpacing: '-0.03em', color: 'var(--text-primary)',
      }}>WhatSource</span>
    </div>
  );
}

/* ─── Animated grid background ─────────────────────────────────────── */
function GridBg() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)
        `,
        backgroundSize: '64px 64px',
        WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 0%, black 20%, transparent 80%)',
        maskImage: 'radial-gradient(ellipse 90% 70% at 50% 0%, black 20%, transparent 80%)',
      }} />
      {/* Central radial glow */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '80%', height: '60%',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.07) 0%, transparent 70%)',
      }} />
      {/* Secondary off-center glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '20%',
        width: '40%', height: '40%',
        background: 'radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.025) 0%, transparent 70%)',
      }} />
    </div>
  );
}

/* ─── Corner brackets for the drop zone ────────────────────────────── */
function CornerBrackets({ active }) {
  const c = active ? 'var(--accent)' : 'rgba(255,255,255,0.14)';
  const w = 28;
  const positions = [
    { top: -1, left: -1, borderTop: `1.5px solid ${c}`, borderLeft: `1.5px solid ${c}` },
    { top: -1, right: -1, borderTop: `1.5px solid ${c}`, borderRight: `1.5px solid ${c}` },
    { bottom: -1, left: -1, borderBottom: `1.5px solid ${c}`, borderLeft: `1.5px solid ${c}` },
    { bottom: -1, right: -1, borderBottom: `1.5px solid ${c}`, borderRight: `1.5px solid ${c}` },
  ];
  return <>
    {positions.map((s, i) => (
      <div key={i} style={{ position: 'absolute', width: w, height: w, transition: 'all 0.3s ease', ...s }} />
    ))}
  </>;
}

/* ─── Demo tile ─────────────────────────────────────────────────────── */
function DemoTile({ demo, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: h ? 'rgba(255,255,255,0.055)' : 'rgba(255,255,255,0.025)',
        border: `1px solid ${h ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 14, padding: '22px 18px', cursor: 'pointer',
        transition: 'all 0.22s ease',
        transform: h ? 'translateY(-3px)' : 'none',
        boxShadow: h ? '0 12px 40px rgba(0,0,0,0.4)' : 'none',
        textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10,
      }}
    >
      <div style={{ fontSize: 30 }}>{demo.thumb}</div>
      <div>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5,
          color: h ? 'var(--text-primary)' : 'var(--text-secondary)',
          letterSpacing: '-0.01em', lineHeight: 1.3,
        }}>{demo.label}</div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
          color: h ? 'var(--accent)' : 'var(--text-muted)',
          marginTop: 5, transition: 'color 0.2s',
        }}>TRY DEMO →</div>
      </div>
    </button>
  );
}

/* ─── Step card for "How it works" ─────────────────────────────────── */
function StepCard({ num, icon, title, desc }) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        padding: '36px 32px', borderRadius: 16,
        border: `1px solid ${h ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)'}`,
        background: h ? 'rgba(255,255,255,0.028)' : 'rgba(255,255,255,0.01)',
        transition: 'all 0.3s ease',
        transform: h ? 'translateY(-5px)' : 'none',
        boxShadow: h ? '0 20px 60px rgba(0,0,0,0.35)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 42, fontWeight: 400,
          color: 'rgba(255,255,255,0.04)', lineHeight: 1, userSelect: 'none',
        }}>{num}</span>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: 'rgba(59,130,246,0.08)',
          border: '1px solid rgba(59,130,246,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--accent)',
        }}>{icon}</div>
      </div>
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20,
        letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 12,
      }}>{title}</div>
      <div style={{
        fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 14,
        color: 'var(--text-secondary)', lineHeight: 1.75,
      }}>{desc}</div>
    </div>
  );
}

/* ─── Main export ───────────────────────────────────────────────────── */
export default function LandingPage({ onUpload, onDemo, demoTriggers }) {
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState(false);
  const [counter, setCounter] = useState(0);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 80);
    // Animated counter
    const dur = 2800, start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      setCounter(Math.floor((1 - Math.pow(1 - p, 4)) * globalSearchCount));
      if (p < 1) requestAnimationFrame(tick);
    };
    const t = setTimeout(() => requestAnimationFrame(tick), 900);
    return () => clearTimeout(t);
  }, []);

  const handleFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return;
    const fr = new FileReader();
    fr.onload = (e) => onUpload(file, e.target.result);
    fr.readAsDataURL(file);
  }, [onUpload]);

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false); setHover(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const active = dragging || hover;

  const steps = [
    {
      num: '01', title: 'Upload',
      desc: 'Drop any screenshot or short video clip — cropped, mirrored, color-graded, or compressed. Our engine handles it.',
      icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    },
    {
      num: '02', title: 'Analyze',
      desc: 'Multimodal embeddings are generated and matched against 847M indexed frames across global cinema, anime, and international series.',
      icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    },
    {
      num: '03', title: 'Discover',
      desc: 'Get the exact title and episode number, the full franchise viewing order, and every legal streaming platform available in your country.',
      icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    },
  ];

  const contentTypes = [
    'Hollywood Films', 'Anime & Manga', 'K-Dramas', 'C-Dramas',
    'African Cinema', 'Philippine Series', 'Bollywood', 'European Films',
    'TV Series', 'OVAs & Specials', 'Donghua', 'Thai Dramas', 'Short Films', 'Mini-Series',
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', position: 'relative', overflowX: 'hidden' }}>
      <GridBg />

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        padding: '0 48px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(3,5,7,0.85)', backdropFilter: 'blur(24px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo size={22} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em',
            color: 'var(--accent)', background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.25)', borderRadius: 99, padding: '3px 9px',
          }}>BETA</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          {['HOW IT WORKS', 'ABOUT'].map(label => (
            <span key={label} style={{
              fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.1em',
              color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = 'var(--text-secondary)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
            >{label}</span>
          ))}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        paddingTop: 168, paddingBottom: 80,
        paddingLeft: 'clamp(24px, 4vw, 80px)', paddingRight: 'clamp(24px, 4vw, 80px)',
        maxWidth: 1280, margin: '0 auto',
        opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease',
      }}>

        {/* Status chip */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 9, marginBottom: 52,
          padding: '7px 16px', borderRadius: 99,
          border: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.022)',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%', background: 'var(--success)',
            animation: 'pulse-opacity 2s ease-in-out infinite',
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.12em',
            color: 'var(--text-secondary)', textTransform: 'uppercase',
          }}>Visual Media Identification Engine</span>
        </div>

        {/* Big headline */}
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(52px, 9vw, 118px)',
          lineHeight: 0.9, letterSpacing: '-0.035em',
          marginBottom: 36,
        }}>
          <div style={{ animation: 'fadeInUp 0.7s ease both', animationDelay: '0.1s', color: 'var(--text-primary)' }}>
            Any frame.
          </div>
          <div style={{ animation: 'fadeInUp 0.7s ease both', animationDelay: '0.22s', color: 'var(--text-secondary)' }}>
            Any scene.
          </div>
          <div style={{ animation: 'fadeInUp 0.7s ease both', animationDelay: '0.36s', color: 'var(--text-primary)' }}>
            Identified<span style={{ color: 'var(--accent)' }}>.</span>
          </div>
        </h1>

        <p style={{
          fontFamily: 'var(--font-body)', fontWeight: 300,
          fontSize: 'clamp(15px, 1.8vw, 19px)',
          color: 'var(--text-secondary)', maxWidth: 500, lineHeight: 1.8,
          marginBottom: 72,
          animation: 'fadeInUp 0.7s ease both', animationDelay: '0.5s',
        }}>
          Upload a screenshot or short clip. WhatSource identifies the exact movie,
          anime, K-drama, or series — then maps the full franchise and shows you
          where to stream it legally, in your country.
        </p>

        {/* ── UPLOAD ZONE ── */}
        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); setHover(true); }}
          onDragLeave={() => { setDragging(false); setHover(false); }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => { if (!dragging) setHover(false); }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            position: 'relative', borderRadius: 20, padding: '70px 48px',
            background: active ? 'rgba(59,130,246,0.045)' : 'rgba(255,255,255,0.012)',
            border: `1.5px dashed ${active ? 'rgba(59,130,246,0.55)' : 'rgba(255,255,255,0.1)'}`,
            cursor: 'pointer', transition: 'all 0.3s ease',
            boxShadow: active
              ? '0 0 80px rgba(59,130,246,0.08), inset 0 0 80px rgba(59,130,246,0.02)'
              : 'none',
            animation: 'fadeInUp 0.7s ease both', animationDelay: '0.62s',
          }}
        >
          <CornerBrackets active={active} />

          <div style={{ textAlign: 'center' }}>
            {/* Icon */}
            <div style={{
              width: 72, height: 72, margin: '0 auto 28px',
              borderRadius: '50%',
              background: active ? 'rgba(59,130,246,0.14)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${active ? 'rgba(59,130,246,0.35)' : 'rgba(255,255,255,0.08)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s ease',
              animation: 'float 4s ease-in-out infinite',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke={active ? 'var(--accent)' : 'var(--text-secondary)'} strokeWidth="1.4">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round"/>
              </svg>
            </div>

            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22,
              letterSpacing: '-0.02em',
              color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
              marginBottom: 10, transition: 'color 0.3s',
            }}>
              {dragging ? 'Release to analyze' : 'Drop your screenshot or clip here'}
            </div>

            <div style={{
              fontFamily: 'var(--font-body)', fontSize: 13.5,
              color: 'var(--text-muted)', marginBottom: 32, letterSpacing: '0.01em',
            }}>
              PNG · JPG · WebP · MP4 · MOV &nbsp;·&nbsp; Up to 50MB
            </div>

            <button style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.09em',
              color: 'var(--accent)', background: 'rgba(59,130,246,0.09)',
              border: '1px solid rgba(59,130,246,0.25)', borderRadius: 99,
              padding: '11px 28px', transition: 'all 0.2s ease', cursor: 'pointer',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.16)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.09)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)'; }}
            >
              BROWSE FILES
            </button>
          </div>

          <input
            ref={fileInputRef} type="file"
            accept="image/png,image/jpeg,image/webp,video/mp4,video/quicktime"
            style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])}
          />
        </div>

        {/* ── DEMO TILES ── */}
        <div style={{ marginTop: 52, animation: 'fadeInUp 0.7s ease both', animationDelay: '0.76s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.14em',
              color: 'var(--text-muted)',
            }}>OR TRY A DEMO</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {demoTriggers.map(d => (
              <DemoTile key={d.key} demo={d} onClick={() => onDemo(d.key)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <div style={{
        margin: '0 clamp(24px, 4vw, 80px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '60px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 80,
        background: 'rgba(255,255,255,0.008)',
      }}>
        <StatBlock value={counter.toLocaleString()} label="Scenes Identified" sub="Global · Live Count" />
        <div style={{ width: 1, height: 48, background: 'rgba(255,255,255,0.07)' }} />
        <StatBlock value="47" label="Content Categories" sub="From Hollywood to Donghua" />
        <div style={{ width: 1, height: 48, background: 'rgba(255,255,255,0.07)' }} />
        <StatBlock value="190+" label="Countries" sub="Geo-aware Streaming Search" />
      </div>

      {/* ── HOW IT WORKS ── */}
      <section style={{
        maxWidth: 1280, margin: '0 auto',
        padding: `100px clamp(24px, 4vw, 80px)`,
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.16em',
          color: 'var(--accent)', marginBottom: 18, textTransform: 'uppercase',
        }}>How It Works</div>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(30px, 4.5vw, 56px)',
          letterSpacing: '-0.03em', marginBottom: 64,
          color: 'var(--text-primary)', lineHeight: 1.05,
        }}>
          Three steps.<br /><span style={{ color: 'var(--text-secondary)' }}>One answer.</span>
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {steps.map((s, i) => (
            <StepCard key={i} {...s} />
          ))}
        </div>

        {/* Content type cloud */}
        <div style={{
          marginTop: 80, padding: '36px 40px', borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(255,255,255,0.012)',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.15em',
            color: 'var(--text-muted)', marginBottom: 22, textTransform: 'uppercase',
          }}>Supported Content</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
            {contentTypes.map(tag => (
              <span key={tag} style={{
                fontFamily: 'var(--font-body)', fontSize: 13,
                color: 'var(--text-secondary)',
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 99, padding: '6px 16px',
              }}>{tag}</span>
            ))}
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: 13,
              color: 'var(--accent)',
              background: 'rgba(59,130,246,0.07)',
              border: '1px solid rgba(59,130,246,0.18)',
              borderRadius: 99, padding: '6px 16px',
            }}>+ 33 more</span>
          </div>
        </div>
      </section>

      {/* ── OBFUSCATION CALLOUT ── */}
      <section style={{
        maxWidth: 1280, margin: '0 auto',
        padding: `0 clamp(24px, 4vw, 80px) 100px`,
      }}>
        <div style={{
          position: 'relative', borderRadius: 20, overflow: 'hidden',
          border: '1px solid rgba(59,130,246,0.12)',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(255,255,255,0.01) 100%)',
          padding: '56px 60px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center',
        }}>
          {/* Decorative circle */}
          <div style={{
            position: 'absolute', top: -60, right: -60,
            width: 240, height: 240, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em',
              color: 'var(--accent)', marginBottom: 16, textTransform: 'uppercase',
            }}>Obfuscation Resistant</div>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 'clamp(22px, 3vw, 36px)',
              letterSpacing: '-0.025em', color: 'var(--text-primary)',
              lineHeight: 1.15, marginBottom: 16,
            }}>Built for the real internet.</h3>
            <p style={{
              fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 15,
              color: 'var(--text-secondary)', lineHeight: 1.8,
            }}>
              Social media clips are almost always modified — mirrored, re-colored,
              sped up, or heavily compressed. WhatSource generates standard
              and flipped embeddings and applies normalization filters so even
              degraded frames match correctly.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              'Mirrored / horizontally flipped frames',
              'Color grading & saturation shifts',
              'Speed-altered video clips',
              'Heavy social media compression',
              'Cropped or zoomed scenes',
            ].map((feat, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(59,130,246,0.15)',
                  border: '1px solid rgba(59,130,246,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                    <polyline points="2,6 5,9 10,3" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: 14,
                  color: 'var(--text-secondary)',
                }}>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.04)',
        padding: '32px clamp(24px, 4vw, 80px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: 1280, margin: '0 auto',
      }}>
        <Logo size={18} opacity={0.5} />
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10.5,
          color: 'var(--text-faint)', letterSpacing: '0.06em',
        }}>© 2025 · PROTOTYPE v0.1.0 · BUILT WITH MOCK DATA</span>
      </footer>
    </div>
  );
}

function StatBlock({ value, label, sub }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontWeight: 400, letterSpacing: '-0.02em',
        fontSize: 'clamp(28px, 4vw, 52px)',
        color: 'var(--text-primary)',
      }}>{value}</div>
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
        color: 'var(--text-secondary)', marginTop: 4,
      }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
        color: 'var(--text-muted)', marginTop: 4,
      }}>{sub}</div>
    </div>
  );
}
