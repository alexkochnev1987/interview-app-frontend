/**
 * AI assistant chat API contract (current backend).
 *
 * Session: `RecruiterAssistantChatDto` sends `message` plus optional
 * `sessionId` on follow-up turns. No client `history` / `conversationId`; the
 * backend owns multi-turn context via `sessionId`.
 *
 * Confirm: send `message: ASSISTANT_CONFIRM_MESSAGE` with `pendingActionId`
 * (and `sessionId`) from the prior `needs_confirmation` response. Optionally
 * include `pendingAction` when the user removed questions from a create-interview
 * plan. The server re-validates the pending action server-side.
 *
 * Cancel: client-only — `dismissPendingAction` clears local state. No cancel
 * endpoint exists. Sending a new message also clears pending state locally.
 */
export const ASSISTANT_CONFIRM_MESSAGE = 'confirm' as const

export const ASSISTANT_CHAT_LAUNCHER_ID = 'assistant-chat-launcher'
export const ASSISTANT_CHAT_COMPOSER_ID = 'assistant-chat-composer'
export const ASSISTANT_CHAT_WIDGET_TITLE_ID = 'assistant-chat-widget-title'
