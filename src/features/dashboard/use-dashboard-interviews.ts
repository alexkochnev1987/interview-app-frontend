import { useEffect, useState } from 'react';

import { fetchInterviews, type Interview } from '@/lib/api';

import { MOCK_INTERVIEWS } from './mock-interviews';

interface UseDashboardInterviewsResult {
  interviews: Interview[];
  loading: boolean;
  error: string | null;
  usingMock: boolean;
}

export function useDashboardInterviews(): UseDashboardInterviewsResult {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchInterviews();
        if (!cancelled) {
          setInterviews(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setInterviews(MOCK_INTERVIEWS);
          setUsingMock(true);
          setError(err instanceof Error ? err.message : 'API unavailable');
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { interviews, loading, error, usingMock };
}
