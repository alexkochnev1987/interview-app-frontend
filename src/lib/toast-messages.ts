export const TOAST_MESSAGES = {
  question: {
    createSuccess: "Question created",
    createError: "Failed to create question",
    saveSuccess: "Question saved",
    saveError: "Failed to save question",
    restoreSuccess: "Question restored",
    restoreError: "Failed to restore question",
    deleteSuccess: "Question deleted",
    deleteError: "Failed to delete question",
  },
  interview: {
    createSuccess: "Interview created",
    createError: "Failed to create interview",
    refreshLinkSuccess: "Candidate link refreshed",
    refreshLinkError: "Failed to refresh candidate link",
    validationStartSuccess: "Validation started",
    validationStartError: "Failed to start interview validation",
    uploadSuccess: (questionNumber: number) => `Upload completed for question ${questionNumber}`,
    uploadError: (questionNumber: number) => `Upload failed for question ${questionNumber}`,
  },
  take: {
    submitSuccess: "Answer submitted",
    submitError: "Failed to submit answer",
  },
  bulkDelete: {
    failedTitle: "Bulk delete failed",
    partialTitle: (deletedCount: number, blockedCount: number) =>
      `Deleted ${deletedCount}, blocked ${blockedCount}`,
    successTitle: (count: number) => `Deleted ${count} question(s)`,
    successDescription: "The library is up to date.",
    noopTitle: "No questions deleted",
    noopDescription: "None of the selected questions were removed.",
    blockedIntro:
      "These questions are used in active interviews and were not deleted:",
  },
  questionFeed: {
    unavailableTitle: "Question feed unavailable",
  },
  questionFacets: {
    unavailableTitle: "Filter options unavailable",
  },
  similarity: {
    searchFailedTitle: "Similarity search failed",
    noMatches: "No close matches crossed the current similarity threshold.",
  },
  pageGate: {
    login: {
      failedTitle: "Authentication failed",
      failedFallback: "Login failed",
      signingInLabel: "Signing in...",
      signInLabel: "Sign In",
    },
    dashboard: {
      forbiddenTitle: "Sign in to view the dashboard",
      forbiddenDescription:
        "This workspace requires an authenticated account. Sign in to continue.",
      unavailableTitle: "Dashboard is unavailable right now",
      loadFailedTitle: "Could not load dashboard",
      loadFailedFallback: "Failed to load interviews.",
      signInActionLabel: "Sign in",
      questionBankActionLabel: "Go to question bank",
    },
    assessments: {
      loadFailedTitle: "Could not load assessments",
      loadFailedFallback: "Failed to load assessments.",
      unavailableTitle: "Assessment unavailable",
      loadDetailFallback: "Failed to load assessment.",
      notFoundFallback: "The requested assessment could not be loaded.",
    },
    interview: {
      forbiddenTitle: "You don't have access to this interview",
      forbiddenDescription:
        "Configuring interviews is reserved for HR, admin, and super-admin users. If you think this is a mistake, contact your workspace owner.",
      createUnavailableTitle: "Interview setup is unavailable right now",
      unavailableTitle: "Interview unavailable",
      loadFailedFallback: "Failed to load interview.",
      notFoundFallback: "The requested interview could not be loaded.",
      setupBlockedTitle: "Interview setup blocked",
      candidateNameRequired: "Candidate name is required.",
      positionRequired: "Position is required.",
      questionsRequired: "Select at least one question.",
      creatingLabel: "Creating...",
    },
    feedback: {
      unavailableTitle: "Feedback unavailable",
      loadFailedFallback: "Failed to load",
    },
    questions: {
      editorIssueTitle: "Question editor issue",
      loadFailedTitle: "Load failed",
      unavailableTitle: "Question unavailable",
      loadFailedCardDescription:
        "The editor could not load this question, so the route stops here instead of rendering a partially broken form.",
    },
  },
  rerun: {
    alreadyInProgressTitle: "Re-evaluation already in progress",
    startFailedTitle: "Could not start re-evaluation",
    allFailedFallback: "Failed to start re-evaluation.",
    answerFailedFallback: "Failed to start re-evaluation for this answer.",
    nothingToReevaluateTitle: "Nothing to re-evaluate",
    nothingToReevaluateMessage:
      "No submitted answers to score yet. The candidate has not finished any answers.",
    queuedLabel: "Re-evaluation queued",
  },
  deleteQuestion: {
    cannotDeleteTitle: "Cannot delete",
  },
} as const
