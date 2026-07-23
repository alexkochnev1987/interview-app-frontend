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

export function isInterviewHrAssignmentDirty(
  interview: Pick<Interview, 'assignedHrId' | 'assignedHr'>,
  assignedHrId?: string,
): boolean {
  const initialAssignedHrId = interview.assignedHrId ?? interview.assignedHr?.id
  return (assignedHrId ?? undefined) !== (initialAssignedHrId ?? undefined)
}

export function isInterviewEditDirty(
  interview: Pick<
    Interview,
    'candidateName' | 'position' | 'questions' | 'assignedHrId' | 'assignedHr'
  >,
  candidateName: string,
  position: string,
  selectedById: ReadonlyMap<string, unknown>,
  assignedHrId?: string
): boolean {
  const initialAssignedHrId = interview.assignedHrId ?? interview.assignedHr?.id
  if ((assignedHrId ?? undefined) !== (initialAssignedHrId ?? undefined)) {
    return true
  }
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
