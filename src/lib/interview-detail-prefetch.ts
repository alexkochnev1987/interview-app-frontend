import type {
  CandidateLinkResponse,
  Interview,
  InterviewAnswerMediaResponse,
} from '@/lib/api'
import { type ServerRequestContext, requestServer } from '@/lib/server-fetch'

export type PrefetchedAnswerMedia = {
  cameraUrl?: string
  screenUrl?: string
  errorMessage?: string
}

export type InterviewDetailExtras = {
  candidateLink: string | null
  candidateLinkError: string | null
  mediaByQuestion: Record<number, PrefetchedAnswerMedia>
}

function readError(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

function toAbsoluteCandidateLink(relativeLink: string, origin: string): string {
  try {
    return new URL(relativeLink, origin).toString()
  } catch {
    return relativeLink
  }
}

async function prefetchCandidateLink(
  encodedId: string,
  ctx: ServerRequestContext,
): Promise<Pick<InterviewDetailExtras, 'candidateLink' | 'candidateLinkError'>> {
  try {
    const response = await requestServer<CandidateLinkResponse>(
      `/interviews/${encodedId}/candidate-link`,
      ctx,
      { method: 'POST' },
    )
    return {
      candidateLink: response?.candidateLink
        ? toAbsoluteCandidateLink(response.candidateLink, ctx.origin)
        : null,
      candidateLinkError: null,
    }
  } catch (err) {
    return {
      candidateLink: null,
      candidateLinkError: readError(err, 'Failed to generate candidate link.'),
    }
  }
}

async function prefetchMediaByQuestion(
  encodedId: string,
  interview: Interview,
  ctx: ServerRequestContext,
): Promise<Record<number, PrefetchedAnswerMedia>> {
  const entries = await Promise.all(
    interview.answers
      .filter((answer) => answer.mediaKey || answer.screenMediaKey)
      .map(async (answer) => {
        const questionIndex = answer.questionIndex
        try {
          const media = await requestServer<InterviewAnswerMediaResponse>(
            `/interviews/${encodedId}/questions/${questionIndex}/media`,
            ctx,
          )
          return [
            questionIndex,
            {
              cameraUrl: media?.cameraUrl ?? undefined,
              screenUrl: media?.screenUrl ?? undefined,
            },
          ] as const
        } catch (err) {
          return [
            questionIndex,
            { errorMessage: readError(err, 'Failed to load media.') },
          ] as const
        }
      }),
  )

  return Object.fromEntries(entries)
}

export async function prefetchInterviewDetailExtras(
  id: string,
  interview: Interview,
  ctx: ServerRequestContext,
): Promise<InterviewDetailExtras> {
  const encodedId = encodeURIComponent(id)
  const [link, mediaByQuestion] = await Promise.all([
    prefetchCandidateLink(encodedId, ctx),
    prefetchMediaByQuestion(encodedId, interview, ctx),
  ])

  return { ...link, mediaByQuestion }
}
