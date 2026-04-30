export const SURFACE_WHITE_SOFT_BORDER = 'border-white/65';
export const SURFACE_WHITE_MUTED_BORDER = 'border-white/60';
export const SURFACE_WHITE_SOFT_BG = 'bg-white/88';
export const SURFACE_WHITE_PANEL_BG = 'bg-white/85';

export const SURFACE_LOW_SOFT_BG = 'bg-[hsl(var(--surface-low)/0.8)]';
export const SURFACE_LOW_BG = 'bg-[hsl(var(--surface-low)/0.85)]';
export const SURFACE_LOW_STRONG_BG = 'bg-[hsl(var(--surface-low)/0.9)]';

export const SURFACE_SHADOW_SOFT = 'shadow-soft';
export const SURFACE_SHADOW_FLOAT = 'shadow-float';

export const RING_BORDER_SOFT = 'ring-1 ring-border/45';
export const RING_BORDER_SUBTLE = 'ring-1 ring-border/50';
export const RING_BORDER_LIGHT = 'ring-1 ring-border/40';

export const SURFACE_PRIMARY_SOFT_BG = 'bg-[hsl(var(--primary-fixed)/0.8)]';
export const SURFACE_PRIMARY_SOFT_TEXT = 'text-[hsl(var(--primary))]';
export const SURFACE_PRIMARY_ELEVATED_BG = 'bg-[hsl(var(--primary-fixed)/0.85)]';

export const SURFACE_CARD_BASE_SOFT =
  `${SURFACE_WHITE_SOFT_BORDER} ${SURFACE_WHITE_SOFT_BG} ${SURFACE_SHADOW_SOFT}`;

export const STATUS_NEUTRAL_SURFACE =
  'bg-[hsl(var(--surface-low))] text-[hsl(var(--muted-foreground))] ring-1 ring-[hsl(var(--border)/0.55)]';
export const STATUS_PENDING_SURFACE =
  'bg-[var(--color-status-pending-bg)] text-[var(--color-status-pending-fg)] ring-1 ring-[var(--color-status-pending-ring)]';
export const STATUS_IN_PROGRESS_SURFACE =
  'bg-[var(--color-status-in-progress-bg)] text-[var(--color-status-in-progress-fg)] ring-1 ring-[var(--color-status-in-progress-ring)]';
export const STATUS_PROCESSING_SURFACE =
  'bg-[var(--color-status-processing-bg)] text-[var(--color-status-processing-fg)] ring-1 ring-[var(--color-status-processing-ring)]';
export const STATUS_COMPLETED_SURFACE =
  'bg-[var(--color-status-completed-bg)] text-[var(--color-status-completed-fg)] ring-1 ring-[var(--color-status-completed-ring)]';
export const STATUS_FAILED_SURFACE =
  'bg-[var(--color-status-failed-bg)] text-[var(--color-status-failed-fg)] ring-1 ring-[var(--color-status-failed-ring)]';
export const STATUS_DESTRUCTIVE_SURFACE = 'bg-destructive/10 text-destructive ring-1 ring-destructive/30';
export const STATUS_NEUTRAL_META_SURFACE = `${STATUS_NEUTRAL_SURFACE} normal-case tracking-[0.08em]`;

export const STATUS_PILL_BASE =
  'rounded-full border-0 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.16em] uppercase shadow-none';

export const METRIC_PANEL_SURFACE = `rounded-[1.5rem] ${SURFACE_LOW_STRONG_BG} p-5 ${RING_BORDER_SOFT}`;
export const METRIC_PANEL_ELEVATED = `rounded-[1.25rem] bg-white/80 p-4 ${RING_BORDER_SOFT}`;
export const METRIC_PANEL_COMPACT = `rounded-[1rem] ${SURFACE_LOW_BG} p-3 ${RING_BORDER_SOFT}`;
