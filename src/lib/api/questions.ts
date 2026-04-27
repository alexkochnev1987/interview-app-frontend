import { request } from './client';
import type {
  Question,
  QuestionDraft,
  QuestionInput,
  SimilarQuestionMatch,
} from './types';

export async function fetchQuestions(): Promise<Question[]> {
  return request<Question[]>('/questions');
}

export async function getQuestion(id: string): Promise<Question> {
  return request<Question>(`/questions/${id}`);
}

export async function createQuestion(data: QuestionInput): Promise<Question> {
  return request<Question>('/questions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateQuestion(id: string, data: QuestionInput): Promise<Question> {
  return request<Question>(`/questions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function draftQuestion(question: Partial<QuestionInput>): Promise<QuestionDraft> {
  return request<QuestionDraft>('/ai/question-draft', {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
}

export async function findSimilarQuestions(
  draft: Partial<QuestionInput>,
  excludeQuestionId?: string,
  limit = 5,
): Promise<SimilarQuestionMatch[]> {
  const res = await request<{ matches: SimilarQuestionMatch[] }>('/questions/similar', {
    method: 'POST',
    body: JSON.stringify({ draft, excludeQuestionId, limit }),
  });
  return res.matches;
}
