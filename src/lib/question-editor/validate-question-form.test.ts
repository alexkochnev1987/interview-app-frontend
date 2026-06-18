import { describe, expect, it } from 'vitest'

import {
  getFirstNonEnglishField,
  validateQuestionForm,
} from '@/lib/question-editor/validate-question-form'

const messages = {
  questionTextRequired: 'Question text is required',
  metadataInvalidJson: 'Invalid metadata JSON',
  metadataMustBeObject: 'Metadata must be a JSON object',
}

describe('validate-question-form', () => {
  it('flags non-English scripts and validates form fields', () => {
    expect(
      getFirstNonEnglishField([
        { fieldLabel: 'Question', value: 'Что такое замыкание?' },
      ]),
    ).toBe('Question')
    expect(
      getFirstNonEnglishField([
        { fieldLabel: 'Question', value: 'Explain closures' },
      ]),
    ).toBeNull()

    const invalid = validateQuestionForm(
      { questionText: '   ', metadataText: '' },
      messages,
    )
    expect(invalid.errors.questionText).toBe(messages.questionTextRequired)

    const valid = validateQuestionForm(
      { questionText: 'Hello', metadataText: '{"tier":"senior"}' },
      messages,
    )
    expect(valid.errors).toEqual({})
    expect(valid.metadata).toEqual({ tier: 'senior' })

    const badJson = validateQuestionForm(
      { questionText: 'Hello', metadataText: '{' },
      messages,
    )
    expect(badJson.errors.metadata).toBe(messages.metadataInvalidJson)
  })
})
