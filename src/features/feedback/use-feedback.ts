import { useEffect, useState } from 'react';

import { fetchFeedback } from '@/lib/api';

import type { Feedback } from './types';

interface UseFeedbackResult {
  feedback: Feedback | null;
  error: string;
}

export function useFeedback(id: string, token: string): UseFeedbackResult {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeedback(id, token)
      .then((data) => setFeedback(data))
      .catch((err) => {
        const message = err instanceof Error ? err.message : 'Failed to load';
        if (message.includes('API error 404') || message.includes('API error 401')) {
          setError('Invalid or expired feedback link');
          return;
        }
        setError(message);
      });
  }, [id, token]);

  return { feedback, error };
}
