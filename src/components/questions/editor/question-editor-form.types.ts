import type { FormEvent } from 'react';

import type { QuestionInput } from '@/lib/api';

export interface QuestionEditorFormProps {
  value: QuestionInput;
  metadataText: string;
  setMetadataText: (value: string) => void;
  submitting: boolean;
  submitLabel: string;
  onUpdate: (patch: Partial<QuestionInput>) => void;
  onSubmit: (event: FormEvent) => void;
}
