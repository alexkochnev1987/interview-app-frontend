import type { Interview } from '@/lib/api';

export function getDashboardMetrics(interviews: Interview[]) {
  const activeCount = interviews.filter((interview) =>
    ['pending', 'in_progress', 'processing'].includes(interview.status),
  ).length;
  const completedCount = interviews.filter((interview) => interview.status === 'completed').length;
  const questionVolume = interviews.reduce((sum, interview) => sum + interview.questions.length, 0);

  return { activeCount, completedCount, questionVolume };
}
