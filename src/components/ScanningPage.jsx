import React, { useState, useEffect } from 'react';

const STAGES = [
  'Preprocessing media...',
  'Running Trace.moe anime detection...',
  'Running Gemini vision analysis...',
  'Cross-referencing databases...',
  'Enriching with TMDB metadata...',
  'Fetching cast & franchise data...',
  'Checking streaming availability...',
  'Finalizing results...',
];

export default function ScanningPage({ preview, stage }) {
  const [progress,   setProgress]   = useState(0);
  const [stageIdx,   setStageIdx]   = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [dots,       setDots]       = useState('');

  useEffect(() => {
    // Progress bar
    const pInt = setInterval(() => {
      setProgress(p => {
        const next = p + (Math.random() * 2.2 + 0.4);
        return next >= 95 ? 95 : next;
      });
    }, 100);

    // Stage cycling
    const sInt = setInterval(() => {
      setStageIdx(i => (i + 1) % STAGES.length);
    }, 600);

    // Confidence building
    const cInt = setInterval(() => {
      setConfidence(c => {
        const next = c + (Math.random() * 3 + 0.5);
        return next >= 94 ? 94 : next;
      });
    }, 120);

    // Dots
    const dInt = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 380);

    return () => { clearInterval(pInt); clearInterval(sInt); clearInterval(cInt); clearInterval(dInt); };
  }, []);

  const currentStage = stage || STAGES[stageIdx];

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--black)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>

      {/* ── BLURRED PREVIEW BG ── */}
      {preview && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `url(${preview})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'blur(60px) brightness(0.06) saturate(0.4)',
          transform: 'scale(1.2)',
        }} />
      )}

      {/* ── GRID ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        backgroundImage: `linear-gradient(rgba(255,229,0,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,229,0,0.025) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />

      {/* ── SCANLINE ── */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 2, zIndex: 5, top: 0,
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,229,0,0.08) 15%, rgba(255,229,0,0.7) 50%, rgba(255,229,0,0.08) 85%, transparent 100%)',
        boxShadow: '0 0 24px rgba(255,229,0,0.5)',
        animation: 'scanline 2s linear infinite',
      }} />

      {/* ── CORNER BRACKETS ── */}
      {[
        { top: 32, left: 32,    borderTop: '1.5px solid rgba(255,229,0,0.4)', borderLeft: '1.5px solid rgba(255,229,0,0.4)' },
        { top: 32, right: 32,   borderTop: '1.5px solid rgba(255,229,0,0.4)', borderRight: '1.5px solid rgba(255,229,0,0.4)' },
        { bottom: 32, left: 32, borderBottom: '1.5px solid rgba(255,229,0,0.4)', borderLeft: '1.5px solid rgba(255,229,0,0.4)' },
        { bottom: 32, right: 32,borderBottom: '1.5px solid rgba(255,229,0,0.4)', borderRight: '1.5px solid rgba(255,229,0,0.4)' },
      ].map((s, i) => <div key={i} style={{ position: 'absolute', width: 32, height: 32, zIndex: 10, ...s }} />)}

      {/* ── LOGO TOP LEFT ── */}
      <div style={{ position: 'absolute', top: 22, left: 36, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <svg width="18" height="18" viewBox="0 0 26 26" fill="none">
            <polygon points="13,1 25,24 1,24" fill="var(--gold)" opacity="0.7"/>
            <polygon points="13,8 21,22 5,22" fill="var(--black)"/>
          </svg>
          <span style={{ fontFamily: 'var(--fd)', fontWeight: 900, fontSize: 13, letterSpacing: '-0.03em', color: 'rgba(255,255,255,0.5)' }}>WhatSource</span>
        </div>
      </div>

      {/* ── MAIN CENTER ── */}
      <div style={{ position: 'relative', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Radar */}
        <div style={{ position: 'relative', width: 200, height: 200, marginBottom: 52 }}>

          {/* Rings */}
          {[100, 72, 46].map((pct, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: `${pct}%`, height: `${pct}%`,
              top: `${(100 - pct) / 2}%`, left: `${(100 - pct) / 2}%`,
              borderRadius: '50%',
              border: `1px solid rgba(255,229,0,${0.18 - i * 0.04})`,
              animation: `pulse-ring ${2.5 + i * 0.5}s ease-in-out infinite`,
            }} />
          ))}

          {/* Tick ring */}
          <svg style={{ position: 'absolute', inset: 0 }} width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="97" fill="none"
              stroke="rgba(255,229,0,0.08)" strokeWidth="1" strokeDasharray="3 9" />
          </svg>

          {/* Outer spin */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '1.5px solid transparent',
            borderTopColor: 'var(--gold)',
            borderRightColor: 'rgba(255,229,0,0.3)',
            animation: 'spin 1.8s linear infinite',
          }} />

          {/* Inner spin reverse */}
          <div style={{
            position: 'absolute', inset: 14, borderRadius: '50%',
            border: '1px solid transparent',
            borderBottomColor: 'rgba(255,229,0,0.6)',
            borderLeftColor: 'rgba(255,229,0,0.15)',
            animation: 'spin-r 2.8s linear infinite',
          }} />

          {/* Radar sweep */}
          <svg style={{ position: 'absolute', inset: 0, animation: 'radar 2.2s linear infinite' }}
            width="200" height="200" viewBox="0 0 200 200">
            <defs>
              <radialGradient id="sweep" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="rgba(255,229,0,0)" />
                <stop offset="100%" stopColor="rgba(255,229,0,0.1)" />
              </radialGradient>
            </defs>
            <path d="M100,100 L100,4 A96,96 0 0,1 196,100 Z" fill="url(#sweep)" />
            <line x1="100" y1="100" x2="100" y2="5" stroke="rgba(255,229,0,0.6)" strokeWidth="1" />
          </svg>

          {/* Crosshair */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: 40, height: 40 }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(255,229,0,0.4)', transform: 'translateY(-50%)' }} />
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(255,229,0,0.4)', transform: 'translateX(-50%)' }} />
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)',
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--gold)',
                boxShadow: '0 0 16px var(--gold), 0 0 6px white',
                animation: 'pulse-ring 1.2s ease-in-out infinite',
              }} />
            </div>
          </div>

          {/* Preview thumbnail in center if available */}
          {preview && (
            <div style={{
              position: 'absolute', top: '30%', left: '30%', width: '40%', height: '40%',
              borderRadius: 4, overflow: 'hidden', opacity: 0.3, border: '1px solid rgba(255,229,0,0.3)',
            }}>
              <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          {/* Confidence */}
          <div style={{
            position: 'absolute', bottom: -28, left: 0, right: 0, textAlign: 'center',
            fontFamily: 'var(--fm)', fontSize: 11, color: 'rgba(255,229,0,0.7)', letterSpacing: '0.08em',
          }}>{Math.floor(confidence)}% CONFIDENCE</div>
        </div>

        {/* Status */}
        <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: '0.18em', color: 'rgba(255,229,0,0.55)', marginBottom: 12, textTransform: 'uppercase' }}>
          ANALYZING{dots}
        </div>
        <div style={{ fontFamily: 'var(--fb)', fontWeight: 300, fontSize: 15, color: 'var(--text-2)', marginBottom: 30, minHeight: 22 }}>
          {currentStage}
        </div>

        {/* Progress */}
        <div style={{ width: 320, height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 1,
            width: `${progress}%`,
            background: 'linear-gradient(90deg, rgba(255,229,0,0.7), var(--gold))',
            transition: 'width 0.12s ease',
            boxShadow: '0 0 12px rgba(255,229,0,0.6)',
          }} />
        </div>
        <div style={{ fontFamily: 'var(--fm)', fontSize: 10, color: 'var(--text-3)', marginTop: 9, letterSpacing: '0.08em' }}>
          {Math.floor(progress)}% COMPLETE
        </div>
      </div>

      {/* ── TECH READOUT BOTTOM LEFT ── */}
      <div style={{
        position: 'absolute', bottom: 40, left: 40, zIndex: 20,
        fontFamily: 'var(--fm)', fontSize: 9, lineHeight: 2,
        color: 'rgba(255,229,0,0.2)', letterSpacing: '0.07em',
      }}>
        <div>ENGINE: WhatSource v1.0 — HYBRID MULTIMODAL</div>
        <div>MODELS: Gemini 1.5 Flash + Trace.moe + SauceNAO</div>
        <div>DATABASES: TMDB · AniList · Jikan · OMDb · TVMaze</div>
        <div>REGION: Auto-Detected via IPinfo</div>
      </div>
    </div>
  );
}
