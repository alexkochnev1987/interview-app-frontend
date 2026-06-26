import type { QuestionsQueryState } from '@/lib/questions-query-state'
import type { ActiveFilterChip } from './question-picker-toolbar'
import type { UseQuestionsQueryResult } from './use-questions-query'

type ChipBuilderOptions = {
  showStatusFilter: boolean
}

export type ActiveFilterChipDescriptor =
  | { kind: 'difficulty'; value: string }
  | { kind: 'category'; value: string }
  | { kind: 'subcategory'; value: string }
  | { kind: 'role'; value: string }
  | { kind: 'tag'; value: string }
  | { kind: 'status'; value: 'inactive' | 'all' | 'active' | 'scheduled'}

export function buildActiveFilterChips(
  state: QuestionsQueryState,
  setters: Pick<
    UseQuestionsQueryResult,
    | 'setDifficulty'
    | 'setCategory'
    | 'setSubcategory'
    | 'setRole'
    | 'setTags'
    | 'setStatus'
  >,
  options: ChipBuilderOptions,
  getChipLabel: (descriptor: ActiveFilterChipDescriptor) => string,
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = []
  if (state.difficulty) {
    chips.push({
      key: `difficulty:${state.difficulty}`,
      label: getChipLabel({ kind: 'difficulty', value: state.difficulty }),
      onRemove: () => setters.setDifficulty(undefined),
    })
  }
  if (state.category) {
    chips.push({
      key: `category:${state.category}`,
      label: getChipLabel({ kind: 'category', value: state.category }),
      onRemove: () => setters.setCategory(undefined),
    })
  }
  if (state.subcategory) {
    chips.push({
      key: `subcategory:${state.subcategory}`,
      label: getChipLabel({ kind: 'subcategory', value: state.subcategory }),
      onRemove: () => setters.setSubcategory(undefined),
    })
  }
  if (state.role) {
    chips.push({
      key: `role:${state.role}`,
      label: getChipLabel({ kind: 'role', value: state.role }),
      onRemove: () => setters.setRole(undefined),
    })
  }
  for (const tag of state.tags) {
    chips.push({
      key: `tag:${tag}`,
      label: getChipLabel({ kind: 'tag', value: tag }),
      onRemove: () => setters.setTags(state.tags.filter((t) => t !== tag)),
    })
  }
  if (options.showStatusFilter && state.status !== 'active') {
    chips.push({
      key: `status:${state.status}`,
      label: getChipLabel({
        kind: 'status',
        value: state.status === 'inactive' ? 'inactive'
            : state.status === 'scheduled' ? 'scheduled' : 'all',
      }),
      onRemove: () => setters.setStatus('active'),
    })
  }
  return chips
}
