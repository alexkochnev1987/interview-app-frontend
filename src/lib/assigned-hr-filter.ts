export const ASSIGNED_HR_FILTER_UNASSIGNED = 'unassigned'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isAssignedHrFilterUnassigned(
  assignedHrId: string | undefined,
): boolean {
  return assignedHrId === ASSIGNED_HR_FILTER_UNASSIGNED
}

export function isValidAssignedHrFilterId(value: string): boolean {
  return isAssignedHrFilterUnassigned(value) || UUID_PATTERN.test(value)
}
