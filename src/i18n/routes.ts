export const routes = {
  questions: {
    list: '/questions',
    new: '/questions/new',
    detail: (id: string) => `/questions/${encodeURIComponent(id)}`,
  },
  interviews: {
    detail: (id: string) => `/interviews/${encodeURIComponent(id)}`,
    candidateFeedback: (id: string) =>
      `/interviews/${encodeURIComponent(id)}/candidate-feedback`,
  },
} as const
