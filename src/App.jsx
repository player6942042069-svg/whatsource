import React, { useState, useEffect, useCallback } from 'react';
import LandingPage  from './components/LandingPage.jsx';
import ScanningPage from './components/ScanningPage.jsx';
import ResultsPage  from './components/ResultsPage.jsx';
import { processUpload, getClientIp } from './utils/mediaUtils.js';

// ── Views: 'landing' | 'scanning' | 'results' ───────────────────────

export default function App() {
  const [view,      setView]      = useState('landing');
  const [preview,   setPreview]   = useState(null);   // object URL for display
  const [result,    setResult]    = useState(null);   // final API result
  const [error,     setError]     = useState(null);   // error message
  const [scanStage, setScanStage] = useState('');     // status text during scan

  // ── Visual upload handler (file → API) ────────────────────────────
  const handleVisualUpload = useCallback(async (file) => {
    setError(null);
    try {
      setScanStage('Extracting frame...');
      const { base64, mimeType, previewUrl } = await processUpload(file);
      setPreview(previewUrl);
      setView('scanning');

      setScanStage('Detecting content type...');
      const ip = await getClientIp();

      const res = await fetch('/api/analyze', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ imageBase64: base64, mimeType, clientIp: ip }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Could not identify this scene. Try a clearer screenshot.');
        setView('landing');
        return;
      }

      setResult(data.result);
      setView('results');
    } catch (e) {
      console.error(e);
      setError('Something went wrong. Please try again.');
      setView('landing');
    }
  }, []);

  // ── Search result selected (text search → brief scan → results) ───
  const handleSearchResult = useCallback(async (item) => {
    setError(null);
    setPreview(null);
    setView('scanning');
    setScanStage('Fetching details...');

    try {
      // For search results we already have basic data; enrich via analyze
      // by passing the title as a search hint instead of an image
      const ip = await getClientIp();
      const res = await fetch('/api/analyze', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          imageBase64: null,
          searchHint:  { title: item.title, year: item.year, mediaType: item._mediaType, tmdbId: item._tmdbId, anilistId: item._anilistId },
          clientIp:    ip,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.result);
      } else {
        // Fallback: build a result from what search already returned
        setResult(buildResultFromSearch(item));
      }
      setView('results');
    } catch {
      setResult(buildResultFromSearch(item));
      setView('results');
    }
  }, []);

  // ── Global Ctrl+V paste listener ──────────────────────────────────
  useEffect(() => {
    const onPaste = (e) => {
      if (view !== 'landing') return;
      const items = Array.from(e.clipboardData?.items || []);
      const imgItem = items.find(i => i.type.startsWith('image/'));
      if (imgItem) {
        e.preventDefault();
        const file = imgItem.getAsFile();
        if (file) handleVisualUpload(file);
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [view, handleVisualUpload]);

  const handleReset = useCallback(() => {
    setView('landing');
    setPreview(null);
    setResult(null);
    setError(null);
    setScanStage('');
    // Revoke old object URL
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)' }}>
      {view === 'landing' && (
        <LandingPage
          onVisualUpload={handleVisualUpload}
          onSearchResult={handleSearchResult}
          error={error}
          onClearError={() => setError(null)}
        />
      )}
      {view === 'scanning' && (
        <ScanningPage preview={preview} stage={scanStage} />
      )}
      {view === 'results' && result && (
        <ResultsPage result={result} preview={preview} onReset={handleReset} />
      )}
    </div>
  );
}

// ── Fallback result builder from search item ─────────────────────────
function buildResultFromSearch(item) {
  return {
    title:      item.title,
    year:       item.year,
    mediaType:  item._mediaType || 'movie',
    confidence: 90,
    poster:     item.poster,
    synopsis:   item.overview || '',
    genres:     [],
    cast:       [],
    streaming:  [],
    franchise:  [{ title: item.title, year: item.year, relation: 'THIS TITLE', poster: item.poster }],
    tmdbScore:  item.score,
    isAdult:    item.isAdult || false,
    region:     'US',
    identifiedBy: 'search',
  };
}
