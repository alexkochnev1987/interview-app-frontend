export const routes = {
  questions: {
    list: '/questions',
    new: '/questions/new',
    detail: (id: string) => `/questions/${encodeURIComponent(id)}`,
  },
  interviews: {
    list: '/interviews',
    new: '/interviews/new',
    detail: (id: string) => `/interviews/${encodeURIComponent(id)}`,
  }
} as const
