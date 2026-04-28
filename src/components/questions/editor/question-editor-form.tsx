import { QuestionEditorIdentitySection } from './question-editor-identity-section';
import { QuestionEditorPromptSection } from './question-editor-prompt-section';
import { QuestionEditorReferenceSection } from './question-editor-reference-section';
import { QuestionEditorRubricSection } from './question-editor-rubric-section';
import { QuestionEditorSubmitBar } from './question-editor-submit-bar';
import type { QuestionEditorFormProps } from './question-editor-form.types';

export function QuestionEditorForm({
  value,
  metadataText,
  setMetadataText,
  submitting,
  submitLabel,
  onUpdate,
  onSubmit,
}: QuestionEditorFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <QuestionEditorIdentitySection value={value} submitting={submitting} onUpdate={onUpdate} />
      <QuestionEditorPromptSection value={value} submitting={submitting} onUpdate={onUpdate} />
      <QuestionEditorRubricSection value={value} submitting={submitting} onUpdate={onUpdate} />
      <QuestionEditorReferenceSection
        value={value}
        metadataText={metadataText}
        setMetadataText={setMetadataText}
        submitting={submitting}
        onUpdate={onUpdate}
      />
      <QuestionEditorSubmitBar submitting={submitting} submitLabel={submitLabel} />
    </form>
  );
}
