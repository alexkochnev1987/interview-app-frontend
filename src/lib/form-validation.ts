export type FieldErrors<K extends string> = Partial<Record<K, string>>

export function validateLogin(values: {
  email: string
  password: string
}): FieldErrors<'email' | 'password'> {
  const errors: FieldErrors<'email' | 'password'> = {}

  const email = values.email.trim()
  if (!email) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.'
  }
  if (!values.password.trim()) {
    errors.password = 'Password is required.'
  }

  return errors
}

export function validateNewInterview(values: {
  candidateName: string
  position: string
  selectedCount: number
}): FieldErrors<'candidateName' | 'position' | 'questions'> {
  const errors: FieldErrors<'candidateName' | 'position' | 'questions'> = {}

  if (!values.candidateName.trim()) {
    errors.candidateName = 'Candidate name is required.'
  }
  if (!values.position.trim()) {
    errors.position = 'Position is required.'
  }
  if (values.selectedCount === 0) {
    errors.questions = 'Select at least one question.'
  }

  return errors
}
