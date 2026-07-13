import type { InterviewsQueryState } from '@/lib/interviews-query-state'

import type { ActiveFilterChip } from './interview-picker-toolbar'
import type { UseInterviewsQueryResult } from '../hooks/use-interviews-query'

export type ActiveInterviewFilterChipDescriptor =
  | { kind: 'position'; value: string }
  | { kind: 'status'; value: string }

export function buildActiveInterviewFilterChips(
  state: InterviewsQueryState,
  setters: Pick<UseInterviewsQueryResult, 'setPosition' | 'setStatus'>,
  getChipLabel: (descriptor: ActiveInterviewFilterChipDescriptor) => string,
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = []

  if (state.position) {
    chips.push({
      key: `position:${state.position}`,
      label: getChipLabel({ kind: 'position', value: state.position }),
      onRemove: () => setters.setPosition(undefined),
    })
  }

  if (state.status) {
    chips.push({
      key: `status:${state.status}`,
      label: getChipLabel({ kind: 'status', value: state.status }),
      onRemove: () => setters.setStatus(undefined),
    })
  }

  return chips
}
