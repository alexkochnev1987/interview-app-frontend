import { useEffect, useState } from 'react';

import { fetchQuestions, type Question } from '@/lib/api';

interface UseQuestionsState {
  questions: Question[];
  loading: boolean;
  error: string | null;
}

export function useQuestions(): UseQuestionsState {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadQuestions() {
      try {
        const data = await fetchQuestions();
        if (!cancelled) {
          setQuestions(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load questions.');
          setLoading(false);
        }
      }
    }

    loadQuestions();
    return () => {
      cancelled = true;
    };
  }, []);

  return { questions, loading, error };
}
