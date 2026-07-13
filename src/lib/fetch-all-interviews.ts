import type {
  FetchInterviewsParams,
  InterviewListItem,
  PaginatedInterviews,
} from '@/lib/api'

export const ASSESSMENTS_INTERVIEW_PAGE_SIZE = 100

export async function fetchAllInterviewPages(
  fetchPage: (params: FetchInterviewsParams) => Promise<PaginatedInterviews>,
  params: Omit<FetchInterviewsParams, 'page'> = {},
): Promise<InterviewListItem[]> {
  const limit = params.limit ?? ASSESSMENTS_INTERVIEW_PAGE_SIZE
  const items: InterviewListItem[] = []
  let page = 1
  let total = 0

  do {
    const response = await fetchPage({ ...params, page, limit })
    total = response.total
    items.push(...response.items)
    if (response.items.length === 0) break
    page += 1
  } while (items.length < total)

  return items
}
