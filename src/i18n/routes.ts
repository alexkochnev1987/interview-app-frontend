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
    list: '/interviews',
    new: '/interviews/new',
    detail: (id: string) => `/interviews/${encodeURIComponent(id)}`,
    candidateFeedback: (id: string) => `/interviews/${encodeURIComponent(id)}/candidate-feedback`,
    newFromTemplate: (templateId: string) =>
      `/interviews/new?templateId=${encodeURIComponent(templateId)}`,
    newFromInterview: (interviewId: string) =>
      `/interviews/new?fromInterview=${encodeURIComponent(interviewId)}`,
  },
  assessments: {
    list: '/assessments',
    detail: (id: string) => `/assessments/${encodeURIComponent(id)}`,
  },
  profile: {
    me: '/profile',
    detail: (id: string) => `/users/${encodeURIComponent(id)}`,
  },
  feedback: {
    share: (token: string) => `/feedback/share/${encodeURIComponent(token)}`,
  },
  portal: {
    // The candidate's interview list lives on the shared dashboard route ('/'),
    // not a separate landing page — see DashboardPage's role branch.
    home: '/',
    interviewDetail: (id: string) => `/portal/interviews/${encodeURIComponent(id)}`,
    help: '/portal/help',
    // Top-level (not nested under /portal), matching /take and /feedback —
    // it's a chrome-less take-flow-style route, gated via isCandidateFlowPath.
    practice: '/practice',
  },
} as const
