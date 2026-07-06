import type { InterviewFacetsResponse, InterviewListItem } from '@/lib/api'

export type DashboardMetrics = {
  activeCount: number
  completedCount: number
  totalCount: number
  questionVolume: number
}

export function computeDashboardMetrics(
  facets: InterviewFacetsResponse,
  interviews: InterviewListItem[],
): DashboardMetrics {
  const statusCounts = Object.fromEntries(
    facets.statuses.map((entry) => [entry.value, entry.count]),
  )

  return {
    activeCount:
      (statusCounts.pending ?? 0) +
      (statusCounts.in_progress ?? 0) +
      (statusCounts.processing ?? 0),
    completedCount: statusCounts.completed ?? 0,
    totalCount: facets.statuses.reduce((sum, entry) => sum + entry.count, 0),
    questionVolume: interviews.reduce(
      (sum, interview) => sum + interview.questionCount,
      0,
    ),
  }
}
