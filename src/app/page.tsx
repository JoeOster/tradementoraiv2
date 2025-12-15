'use client';

import { useState } from 'react';

export default function Home() {
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAiTest = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai-test');
      const json = await res.json();
      if (json.success) {
        setAiResponse(JSON.stringify(json.data));
      } else {
        setAiResponse(json.error || 'No response from AI.');
      }
    } catch (e: any) {
      setAiResponse(e?.message || 'Request failed');
    }
    setLoading(false);
  };

  return (
    <div>
      <h1>Welcome to Next.js!</h1>
      <button
        onClick={handleAiTest}
        disabled={loading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: loading ? 'not-allowed' : 'pointer',
          backgroundColor: loading ? '#cccccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
        }}
      >
        {loading ? 'Testing AI...' : 'Test AI Connection'}
      </button>
      {aiResponse && (
        <p style={{ marginTop: '20px', fontSize: '18px', color: '#333' }}>
          AI Response: {aiResponse}
        </p>
      )}
    </div>
  );
}
