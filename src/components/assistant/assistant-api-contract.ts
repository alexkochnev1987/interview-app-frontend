/**
 * AI assistant chat API contract (current backend).
 *
 * Session: `RecruiterAssistantChatDto` sends only `message` (+ optional
 * `pendingAction` on confirm). No client `history` / `conversationId`; the
 * backend owns multi-turn context if it persists any at all.
 *
 * Confirm: send `message: ASSISTANT_CONFIRM_MESSAGE` with the `pendingAction`
 * from the prior `needs_confirmation` response. The server re-validates the
 * payload; there is no server-side pending token yet.
 *
 * Cancel: client-only — `dismissPendingAction` clears local state. No cancel
 * endpoint exists. Sending a new message also clears pending state locally.
 */
export const ASSISTANT_CONFIRM_MESSAGE = 'confirm' as const

export const ASSISTANT_CHAT_LAUNCHER_ID = 'assistant-chat-launcher'
export const ASSISTANT_CHAT_COMPOSER_ID = 'assistant-chat-composer'
