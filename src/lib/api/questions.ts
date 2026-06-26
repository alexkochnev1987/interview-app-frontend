import { client, handle, Schemas } from './client';
import { ApiError } from '../api-error';
import type {
  BulkDeleteResult,
  DeleteQuestionResult,
  FetchQuestionFacetsParams,
  FetchQuestionsParams,
  PaginatedQuestions,
  Question,
  QuestionDraft,
  QuestionFacetsResponse,
  QuestionInput,
  SimilarQuestionMatch,
  UpdateQuestionInput,
} from './types';

export async function fetchQuestions(
  params?: FetchQuestionsParams,
  init?: { signal?: AbortSignal },
): Promise<PaginatedQuestions> {
  return handle(
    client.GET('/questions', {
      params: { query: params ?? {} },
      signal: init?.signal,
    }),
  );
}

export async function fetchQuestionFacets(
  params?: FetchQuestionFacetsParams,
  init?: { signal?: AbortSignal },
): Promise<QuestionFacetsResponse> {
  return handle(
    client.GET('/questions/facets', {
      params: { query: params ?? {} },
      signal: init?.signal,
    }),
  );
}

export async function createQuestion(data: QuestionInput): Promise<Question> {
  return handle(client.POST('/questions', {
    body: data
  }));
}

export async function updateQuestion(
  id: string,
  data: UpdateQuestionInput,
): Promise<Question> {
  return handle(client.PATCH('/questions/{id}', {
    params: { path: { id } },
    body: data
  }));
}

export async function deleteQuestion(
  id: string,
): Promise<DeleteQuestionResult> {
  const path = `/questions/${id}`;
  const data = await handle(
    client.DELETE('/questions/{id}', {
      params: { path: { id } },
    }),
  );

  if (data.scheduled === true) {
    return {
      id: data.id,
      scheduled: true,
      blockingInterviews: data.blockingInterviews ?? [],
    };
  }

  if (data.deleted !== true) {
    throw new ApiError(200, 'API error: delete response did not confirm deletion.', path);
  }

  return { id: data.id, deleted: true };
}

export async function restoreQuestion(id: string): Promise<Question> {
  return handle(client.PATCH('/questions/{id}/restore', {
    params: { path: { id } }
  }));
}

export async function deleteQuestionsBulk(
  ids: string[],
): Promise<BulkDeleteResult> {
  return handle(client.POST('/questions/bulk-delete', {
    body: { ids }
  }));
}

export async function draftQuestion(
  question: Schemas['DraftQuestionDto']['question'],
): Promise<QuestionDraft> {
  return handle(client.POST('/ai/question-draft', {
    body: { question }
  }));
}

export async function findSimilarQuestions(
  draft: Partial<QuestionInput>,
  excludeQuestionId?: string,
  limit = 5,
  init?: { signal?: AbortSignal },
): Promise<SimilarQuestionMatch[]> {
  const data = await handle(client.POST('/questions/similar', {
    body: { draft: draft as Schemas['FindSimilarDraftDto'], excludeQuestionId, limit },
    signal: init?.signal,
  }));
  return data.matches;
}
