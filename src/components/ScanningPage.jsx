import React, { useEffect, useState, useRef } from 'react';

const STEPS = [
  'Extracting visual signatures...',
  'Computing multimodal embeddings...',
  'Querying global content index...',
  'Applying obfuscation filters...',
  'Testing mirror variants...',
  'Cross-referencing franchise metadata...',
  'Aggregating streaming catalog...',
  'Compiling results...',
];

const READOUT_LINES = [
  'ENGINE: WhatSource v2.1.4',
  'MODEL: CLIP-ViT-L/14 + VidLang',
  'MIRROR CHECK: ACTIVE',
  'COLOR NORMALIZATION: ON',
  'CATALOG: 847,291,034 FRAMES INDEXED',
  'REGIONS: 190 COUNTRIES ACTIVE',
  'CONFIDENCE THRESHOLD: 85%',
];

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <polygon points="12,2 22,20 2,20" fill="var(--accent)" opacity="0.7" />
        <polygon points="12,7 18,18 6,18" fill="var(--bg-void)" />
      </svg>
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: 14, color: 'var(--text-muted)', letterSpacing: '-0.02em',
      }}>WhatSource</span>
    </div>
  );
}

export default function ScanningPage({ preview, demoKey }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [readoutLine, setReadoutLine] = useState(0);
  const [dots, setDots] = useState('');
  const rafRef = useRef(null);

  useEffect(() => {
    // Progress
    let p = 0;
    const progInterval = setInterval(() => {
      p += Math.random() * 2.8 + 0.5;
      if (p >= 97) { p = 97; clearInterval(progInterval); }
      setProgress(p);
    }, 90);

    // Step cycling
    const stepInterval = setInterval(() => {
      setStep(s => Math.min(s + 1, STEPS.length - 1));
    }, 520);

    // Confidence
    let c = 0;
    const confInterval = setInterval(() => {
      c += Math.random() * 3.5 + 0.3;
      if (c >= 94) { c = 94; clearInterval(confInterval); }
      setConfidence(c);
    }, 110);

    // Readout cycling
    const readoutInterval = setInterval(() => {
      setReadoutLine(l => (l + 1) % READOUT_LINES.length);
    }, 400);

    // Dots animation
    const dotsInterval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 400);

    return () => {
      clearInterval(progInterval);
      clearInterval(stepInterval);
      clearInterval(confInterval);
      clearInterval(readoutInterval);
      clearInterval(dotsInterval);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg-void)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>

      {/* ── BLURRED PREVIEW BG ── */}
      {preview && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${preview})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'blur(48px) brightness(0.07) saturate(0.4)',
          transform: 'scale(1.15)',
        }} />
      )}

      {/* ── GRID OVERLAY ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '44px 44px',
      }} />

      {/* ── SCANNING LINE ── */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.08) 15%, rgba(59,130,246,0.7) 50%, rgba(59,130,246,0.08) 85%, transparent 100%)',
        boxShadow: '0 0 24px rgba(59,130,246,0.5), 0 0 8px rgba(59,130,246,0.8)',
        animation: 'scan 2.2s linear infinite',
      }} />

      {/* ── LOGO TOP LEFT ── */}
      <div style={{ position: 'absolute', top: 24, left: 40 }}>
        <Logo />
      </div>

      {/* ── CORNER BRACKETS ── */}
      {[
        { top: 40, left: 40, borderTop: '1px solid rgba(59,130,246,0.35)', borderLeft: '1px solid rgba(59,130,246,0.35)' },
        { top: 40, right: 40, borderTop: '1px solid rgba(59,130,246,0.35)', borderRight: '1px solid rgba(59,130,246,0.35)' },
        { bottom: 40, left: 40, borderBottom: '1px solid rgba(59,130,246,0.35)', borderLeft: '1px solid rgba(59,130,246,0.35)' },
        { bottom: 40, right: 40, borderBottom: '1px solid rgba(59,130,246,0.35)', borderRight: '1px solid rgba(59,130,246,0.35)' },
      ].map((s, i) => (
        <div key={i} style={{ position: 'absolute', width: 36, height: 36, ...s }} />
      ))}

      {/* ── MAIN CENTER UI ── */}
      <div style={{ position: 'relative', textAlign: 'center', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* ── RADAR CIRCLE ── */}
        <div style={{ position: 'relative', width: 220, height: 220, marginBottom: 52 }}>

          {/* Outer rings */}
          {[100, 76, 52].map((pct, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: `${pct}%`, height: `${pct}%`,
              top: `${(100 - pct) / 2}%`, left: `${(100 - pct) / 2}%`,
              borderRadius: '50%',
              border: `1px solid rgba(59,130,246,${0.18 - i * 0.04})`,
            }} />
          ))}

          {/* Dashed tick ring */}
          <svg style={{ position: 'absolute', inset: 0 }} width="220" height="220" viewBox="0 0 220 220">
            <circle
              cx="110" cy="110" r="106"
              fill="none"
              stroke="rgba(59,130,246,0.1)"
              strokeWidth="1"
              strokeDasharray="4 8"
            />
          </svg>

          {/* Spinning ring 1 */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '1.5px solid transparent',
            borderTopColor: 'var(--accent)',
            borderRightColor: 'rgba(59,130,246,0.25)',
            animation: 'spin-slow 1.8s linear infinite',
          }} />

          {/* Spinning ring 2 (reverse) */}
          <div style={{
            position: 'absolute', inset: 14, borderRadius: '50%',
            border: '1px solid transparent',
            borderBottomColor: 'rgba(96,165,250,0.7)',
            borderLeftColor: 'rgba(59,130,246,0.2)',
            animation: 'spin-slow 2.6s linear infinite reverse',
          }} />

          {/* Inner glow */}
          <div style={{
            position: 'absolute', inset: '30%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
            animation: 'pulse-glow 2s ease-in-out infinite',
          }} />

          {/* Crosshair */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ position: 'relative', width: 50, height: 50 }}>
              {/* H line */}
              <div style={{
                position: 'absolute', top: '50%', left: 0, right: 0,
                height: 1, background: 'rgba(59,130,246,0.4)',
                transform: 'translateY(-50%)',
              }} />
              {/* V line */}
              <div style={{
                position: 'absolute', left: '50%', top: 0, bottom: 0,
                width: 1, background: 'rgba(59,130,246,0.4)',
                transform: 'translateX(-50%)',
              }} />
              {/* Center dot */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--accent)',
                boxShadow: '0 0 16px var(--accent), 0 0 4px white',
                animation: 'pulse-glow 1.4s ease-in-out infinite',
              }} />
            </div>
          </div>

          {/* Sweep arm */}
          <svg
            style={{ position: 'absolute', inset: 0, animation: 'spin-slow 2s linear infinite' }}
            width="220" height="220" viewBox="0 0 220 220"
          >
            <defs>
              <radialGradient id="sweep" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(59,130,246,0)" />
                <stop offset="100%" stopColor="rgba(59,130,246,0.12)" />
              </radialGradient>
            </defs>
            <path
              d="M110,110 L110,4 A106,106 0 0,1 214,110 Z"
              fill="url(#sweep)"
            />
            <line
              x1="110" y1="110" x2="110" y2="6"
              stroke="rgba(59,130,246,0.7)" strokeWidth="1"
            />
          </svg>

          {/* Confidence label positioned below center */}
          <div style={{
            position: 'absolute', bottom: -8, left: 0, right: 0,
            textAlign: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 12,
            color: 'rgba(59,130,246,0.8)', letterSpacing: '0.06em',
          }}>
            {Math.floor(confidence)}% CONFIDENCE
          </div>
        </div>

        {/* ── ANALYZING LABEL ── */}
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          letterSpacing: '0.16em', color: 'rgba(59,130,246,0.6)',
          textTransform: 'uppercase', marginBottom: 14,
        }}>
          Analyzing Visual Signatures{dots}
        </div>

        {/* Current step */}
        <div style={{
          fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 15,
          color: 'var(--text-secondary)', marginBottom: 28,
          minHeight: 22, transition: 'opacity 0.3s',
        }}>
          {STEPS[step]}
        </div>

        {/* Progress bar */}
        <div style={{
          width: 340, height: 2,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 1, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, var(--accent), var(--accent-bright))',
            transition: 'width 0.1s ease',
            boxShadow: '0 0 10px rgba(59,130,246,0.7)',
            borderRadius: 1,
          }} />
        </div>

        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          color: 'var(--text-muted)', marginTop: 10, letterSpacing: '0.08em',
        }}>{Math.floor(progress)}% COMPLETE</div>
      </div>

      {/* ── TECHNICAL READOUT (bottom left) ── */}
      <div style={{
        position: 'absolute', bottom: 48, left: 48,
        fontFamily: 'var(--font-mono)', fontSize: 9.5,
        color: 'rgba(59,130,246,0.28)', letterSpacing: '0.07em', lineHeight: 2,
      }}>
        {READOUT_LINES.map((line, i) => (
          <div key={i} style={{
            opacity: i === readoutLine ? 0.8 : (Math.abs(i - readoutLine) === 1 ? 0.4 : 0.18),
            transition: 'opacity 0.3s ease',
          }}>{line}</div>
        ))}
      </div>

      {/* ── SEARCH COUNT (bottom right) ── */}
      <div style={{
        position: 'absolute', bottom: 48, right: 48,
        textAlign: 'right',
        fontFamily: 'var(--font-mono)', fontSize: 9.5,
        color: 'rgba(59,130,246,0.28)', letterSpacing: '0.07em', lineHeight: 2,
      }}>
        <div>GLOBAL SEARCHES: 2,847,391</div>
        <div>LAST IDENTIFIED: 2 sec ago</div>
        <div>STATUS: ONLINE · ALL SYSTEMS GO</div>
      </div>
    </div>
  );
}
