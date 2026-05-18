export const TOAST_MESSAGES = {
  question: {
    createSuccess: "Question created",
    createError: "Failed to create question",
    saveSuccess: "Question saved",
    saveError: "Failed to save question",
    bulkDeleteSuccess: "Questions deleted",
    bulkDeletePartialSuccess: "Questions deleted with skips",
    bulkDeleteNoopSuccess: "No questions deleted",
    bulkDeleteError: "Failed to delete questions",
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
    assessments: {
      loadFailedTitle: "Could not load assessments",
      loadFailedFallback: "Failed to load assessments.",
      unavailableTitle: "Assessment unavailable",
      loadDetailFallback: "Failed to load assessment.",
      notFoundFallback: "The requested assessment could not be loaded.",
      interviewFailedTitle: "This interview failed to complete",
      interviewFailedDescription:
        "The take ended in a failed state. Some answers, transcripts, or evaluations may be missing. You can re-run AI evaluation for any answer that does have a transcript below.",
    },
    interview: {
      unavailableTitle: "Interview unavailable",
      loadFailedFallback: "Failed to load interview.",
      notFoundFallback: "The requested interview could not be loaded.",
      setupBlockedTitle: "Interview setup blocked",
    },
    feedback: {
      unavailableTitle: "Feedback unavailable",
      loadFailedFallback: "Failed to load",
    },
    questions: {
      editorIssueTitle: "Question editor issue",
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
  restore: {
    cannotRestoreTitle: "Cannot restore",
  },
  deleteQuestion: {
    cannotDeleteTitle: "Cannot delete",
  },
  interviewAction: {
    failedTitle: "Interview action failed",
  },
} as const
