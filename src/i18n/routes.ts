export const routes = {
  questions: {
    list: '/questions',
    new: '/questions/new',
    detail: (id: string) => `/questions/${encodeURIComponent(id)}`,
  },
  templates: {
    list: '/templates',
    new: '/templates/new',
    detail: (id: string) => `/templates/${encodeURIComponent(id)}`,
    newFromInterview: (interviewId: string) =>
      `/templates/new?fromInterview=${encodeURIComponent(interviewId)}`,
  },
  interviews: {
    new: '/interviews/new',
    detail: (id: string) => `/interviews/${encodeURIComponent(id)}`,
    newFromTemplate: (templateId: string) =>
      `/interviews/new?templateId=${encodeURIComponent(templateId)}`,
    newFromInterview: (interviewId: string) =>
      `/interviews/new?fromInterview=${encodeURIComponent(interviewId)}`,
  },
  assessments: {
    list: '/assessments',
    detail: (id: string) => `/assessments/${encodeURIComponent(id)}`,
  },
} as const
