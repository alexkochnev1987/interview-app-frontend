export const FEEDBACK_POLICY = {
  mutation: {
    channel: "toast",
    when: "User-triggered create/update/delete/restore actions.",
    guidance:
      "Use toast feedback for mutation result (success/error) to keep UX consistent across flows.",
  },
  backgroundUpdate: {
    channel: "inline",
    when: "High-frequency, automatic, or polling-driven updates.",
    guidance:
      "Use inline-only status/error handling and avoid toast spam for repeated background events.",
  },
  draftQuestion: {
    channel: "inline",
    when: "AI draft generation inside the question editor form.",
    guidance:
      "Keep draft generation feedback inline in the editor context to help users fix content quickly.",
    inlineErrorFallback: "Failed to generate question draft.",
  },
} as const
