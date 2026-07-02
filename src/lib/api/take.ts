import { client, handle, assertOk } from './client';
import type { SubmitTakeAnswerPayload, TakeInterviewData, TakeProgressPayload } from './types';

export async function getTakeInterview(
  id: string,
  token?: string,
): Promise<TakeInterviewData> {
  return handle(client.GET('/take/{id}', {
    params: {
      path: { id },
      query: token ? { token } : undefined
    }
  }));
}

export async function syncCandidateSession(id: string, token: string): Promise<void> {
  const path = `/take/${encodeURIComponent(id)}`;
  const query = new URLSearchParams({ token });
  const res = await fetch(`/api${path}?${query}`, { credentials: 'include' });

  await assertOk(res, path);

  await res.text();
}

export async function sendTakeAnswerProgress(
  id: string,
  payload: TakeProgressPayload,
): Promise<void> {
  await handle(client.POST('/take/{id}/answer/progress', {
    params: { path: { id } },
    body: payload
  }));
}

export async function submitTakeAnswer(
  id: string,
  payload: SubmitTakeAnswerPayload,
): Promise<void> {
  await handle(client.POST('/take/{id}/answer', {
    params: { path: { id } },
    body: payload
  }));
}
