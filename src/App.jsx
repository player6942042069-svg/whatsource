import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage.jsx';
import ScanningPage from './components/ScanningPage.jsx';
import ResultsPage from './components/ResultsPage.jsx';
import { mockResults, demoTriggers } from './data/mockResults.js';

export default function App() {
  const [view, setView] = useState('landing'); // landing | scanning | results
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedPreview, setUploadedPreview] = useState(null);
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [result, setResult] = useState(null);

  const handleUpload = (file, previewUrl) => {
    setUploadedFile(file);
    setUploadedPreview(previewUrl);
    setView('scanning');
    // After scanning animation, pick a random result
    setTimeout(() => {
      const keys = Object.keys(mockResults);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      setResult(mockResults[randomKey]);
      setView('results');
    }, 4200);
  };

  const handleDemo = (key) => {
    setSelectedDemo(key);
    setUploadedPreview(null);
    setView('scanning');
    setTimeout(() => {
      setResult(mockResults[key]);
      setView('results');
    }, 4200);
  };

  const handleReset = () => {
    setView('landing');
    setUploadedFile(null);
    setUploadedPreview(null);
    setSelectedDemo(null);
    setResult(null);
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {view === 'landing' && (
        <LandingPage
          onUpload={handleUpload}
          onDemo={handleDemo}
          demoTriggers={demoTriggers}
        />
      )}
      {view === 'scanning' && (
        <ScanningPage
          preview={uploadedPreview}
          demoKey={selectedDemo}
        />
      )}
      {view === 'results' && result && (
        <ResultsPage
          result={result}
          preview={uploadedPreview}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
