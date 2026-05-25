import type { QuestionsQueryState } from '@/lib/questions-query-state'
import type { ActiveFilterChip } from './question-picker-toolbar'
import type { UseQuestionsQueryResult } from './use-questions-query'

type ChipBuilderOptions = {
  showStatusFilter: boolean
}

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
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = []
  if (state.difficulty) {
    chips.push({
      key: `difficulty:${state.difficulty}`,
      label: `Difficulty: ${state.difficulty}`,
      onRemove: () => setters.setDifficulty(undefined),
    })
  }
  if (state.category) {
    chips.push({
      key: `category:${state.category}`,
      label: `Category: ${state.category}`,
      onRemove: () => setters.setCategory(undefined),
    })
  }
  if (state.subcategory) {
    chips.push({
      key: `subcategory:${state.subcategory}`,
      label: `Type: ${state.subcategory}`,
      onRemove: () => setters.setSubcategory(undefined),
    })
  }
  if (state.role) {
    chips.push({
      key: `role:${state.role}`,
      label: `Role: ${state.role}`,
      onRemove: () => setters.setRole(undefined),
    })
  }
  for (const tag of state.tags) {
    chips.push({
      key: `tag:${tag}`,
      label: `#${tag}`,
      onRemove: () => setters.setTags(state.tags.filter((t) => t !== tag)),
    })
  }
  if (options.showStatusFilter && state.status !== 'active') {
    chips.push({
      key: `status:${state.status}`,
      label: state.status === 'inactive' ? 'Deleted only' : 'Active + deleted',
      onRemove: () => setters.setStatus('active'),
    })
  }
  return chips
}
