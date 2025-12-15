import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function AiTestButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await fetch('/api/ai-test');
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch from API');
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <Button onClick={handleClick} disabled={loading}>
        {loading ? 'Testing AI...' : 'Test AI: CMYK for Blue'}
      </Button>
      {result && (
        <div className="mt-4 p-4 border rounded bg-green-50">
          <h3 className="font-bold">AI Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
      {error && (
        <div className="mt-4 p-4 border rounded bg-red-50 text-red-700">
          <h3 className="font-bold">Error:</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
