import { useMemo } from 'react'

import { useTranslations } from 'next-intl'



import {

  EDITABLE_FIELD_KEYS,

  GENERATE_DRAFT_FIELD_KEYS,

  TRANSLATE_DRAFT_FIELD_KEYS,

  type DraftFieldKey,

} from '@/lib/question-editor/field-keys'

import type { Locale } from '@/i18n/locales'

import type { QuestionInput } from '@/lib/api'

type FieldKey = keyof QuestionInput



export function useQuestionEditorLabels() {

  const tFields = useTranslations('questions.fields')

  const tValidation = useTranslations('questions.validation')

  const tEditor = useTranslations('questions.editor')

  const tAiDraft = useTranslations('questions.aiDraft')

  const tLanguage = useTranslations('languageSwitcher')



  return useMemo(

    () => ({

      primaryLocale: tEditor('primaryLocale'),

      translateTo: tEditor('translateTo'),

      translate: tEditor('translate'),

      applyAll: tEditor('applyAll'),

      addLanguage: tEditor('addLanguage'),

      removeLanguage: (locale: string) => tEditor('removeLanguage', { locale }),

      emptyTabPlaceholder: tEditor('emptyTabPlaceholder'),

      fieldLabel(key: FieldKey) {

        return tFields(key as FieldKey)

      },

      draftFields: TRANSLATE_DRAFT_FIELD_KEYS.map((key) => ({

        key,

        label: tFields(key),

      })),

      generateDraftFields: GENERATE_DRAFT_FIELD_KEYS.map((key) => ({

        key,

        label: tFields(key),

      })),

      editableFields: EDITABLE_FIELD_KEYS.map((key) => ({

        key,

        label: tFields(key),

      })),

      validation: {

        questionTextRequired: tValidation('questionTextRequired'),

        metadataInvalidJson: tValidation('metadataInvalidJson'),

        metadataMustBeObject: tValidation('metadataMustBeObject'),

        metadataEnglishOnly: tValidation('metadataEnglishOnly'),

        primaryLocaleRequired: tValidation('primaryLocaleRequired'),

        primaryLocaleCannotBeRemoved: tValidation('primaryLocaleCannotBeRemoved'),

        localeAlreadyAdded: ({ locale }: { locale: string }) =>

          tValidation('localeAlreadyAdded', { locale }),

        localeNotAdded: ({ locale }: { locale: string }) =>

          tValidation('localeNotAdded', { locale }),

        localeBlockIncomplete: ({

          locale,

          fields,

        }: {

          locale: string

          fields: string

        }) => tValidation('localeBlockIncomplete', { locale, fields }),

        questionTextRequiredForAi: tEditor('aiQuestionTextRequired'),

        pendingAiDraft: tValidation('pendingAiDraft'),

        pendingTranslationDraft: tValidation('pendingTranslationDraft'),

      },

      previewEmpty: tEditor('previewEmpty'),

      conceptDescriptionFallback: (label: string) =>

        tEditor('conceptDescriptionFallback', { label }),

      localeTabs: {

        localeLabel: (locale: Locale) => tLanguage(`locales.${locale}`),

        addLanguage: tEditor('addLanguage'),

        noLocalesToAdd: tEditor('noLocalesToAdd'),

        removeLanguage: (locale: string) => tEditor('removeLanguage', { locale }),

        tabsAriaLabel: tEditor('tabsAriaLabel'),

        translateErrorFallback: tEditor('localeTranslateErrorFallback'),

      },

      aiDraft: {

        generatingFor: (locale: string) => tAiDraft('generatingFor', { locale }),

      },

    }),

    [tAiDraft, tEditor, tFields, tLanguage, tValidation],

  )

}



export type QuestionEditorLabels = ReturnType<typeof useQuestionEditorLabels>



export function draftFieldLabel(

  labels: QuestionEditorLabels,

  key: DraftFieldKey,

) {

  return labels.draftFields.find((field) => field.key === key)?.label ?? key

}


