/**
 * Public application configuration — exposed to all authenticated users.
 *
 * Mirrors the shape returned by `GET /api/config/public`.
 * Only boolean/numeric knobs consumed by the frontend are listed;
 * the backend may carry additional keys that the UI does not need.
 */
export interface PublicAppConfig {
  /** Maximum answer recording duration in seconds (default: 240). */
  MAX_ANSWER_DURATION_SECONDS: number
  /** Maximum recording attempts per question (default: 3). */
  MAX_ANSWER_ATTEMPTS_PER_QUESTION: number
  /** Whether Google OAuth sign-in button is shown. */
  ENABLE_GOOGLE_OAUTH: boolean
  /** Whether candidate-feedback share links are available. */
  ENABLE_FEEDBACK_SHARE_LINKS: boolean
  /** Emergency killswitch — blocks normal UI when `true`. */
  MAINTENANCE_MODE_KILLSWITCH: boolean
  /** Default UI theme mode (system | light | dark). */
  DEFAULT_THEME_MODE: string
  /** Active UI color theme preset (innowise | red | blue | purple). */
  APP_THEME: string
  /** Whether recruiter AI assistant widget is enabled. */
  ENABLE_AI_ASSISTANT: boolean
}

/** Hardcoded defaults used when the server snapshot is unavailable. */
export const DEFAULT_PUBLIC_APP_CONFIG: PublicAppConfig = {
  MAX_ANSWER_DURATION_SECONDS: 240,
  MAX_ANSWER_ATTEMPTS_PER_QUESTION: 3,
  ENABLE_GOOGLE_OAUTH: true,
  ENABLE_FEEDBACK_SHARE_LINKS: true,
  MAINTENANCE_MODE_KILLSWITCH: false,
  DEFAULT_THEME_MODE: 'system',
  APP_THEME: 'innowise',
  ENABLE_AI_ASSISTANT: true,
}

// ---------------------------------------------------------------------------
// Admin-facing types (super-admin dashboard)
// ---------------------------------------------------------------------------

/** Value type descriptor returned by the config API. */
export type SystemConfigValueType = 'string' | 'number' | 'boolean' | 'enum' | 'json' | 'secret'

/** A single system configuration variable as returned by `GET /api/config`. */
export interface SystemConfigEntry {
  key: string
  value: string
  valueType: SystemConfigValueType
  options?: string[]
  description?: string
  isPublic: boolean
  isSecret: boolean
}

/** Payload for `PUT /api/config/:key`. */
export interface UpdateSystemConfigPayload {
  value: string
  valueType?: SystemConfigValueType
  options?: string[]
  description?: string
  isPublic?: boolean
  isSecret?: boolean
}
