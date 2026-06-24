import type { Interview } from '@/lib/api'

export function getSelectedQuestionIdsInEditOrder(
  initialQuestions: Array<{ id: string }>,
  selectedById: ReadonlyMap<string, unknown>,
): string[] {
  const initialIds = initialQuestions.map((question) => question.id)
  const keptInOrder = initialIds.filter((id) => selectedById.has(id))
  const addedInPickerOrder = Array.from(selectedById.keys()).filter(
    (id) => !initialIds.includes(id),
  )
  return [...keptInOrder, ...addedInPickerOrder]
}

export function isInterviewEditDirty(
  interview: Pick<Interview, 'candidateName' | 'position' | 'questions'>,
  candidateName: string,
  position: string,
  selectedById: ReadonlyMap<string, unknown>,
): boolean {
  if (candidateName.trim() !== interview.candidateName.trim()) {
    return true
  }
  if (position.trim() !== interview.position.trim()) {
    return true
  }

  const initialIds = interview.questions.map((question) => question.id)
  const currentIds = getSelectedQuestionIdsInEditOrder(
    interview.questions,
    selectedById,
  )

  if (initialIds.length !== currentIds.length) {
    return true
  }

  return initialIds.some((id, index) => id !== currentIds[index])
}
