import { WandSparkles } from 'lucide-react';

import { QuestionEditorField } from '@/components/questions/question-editor-field';
import { QuestionEditorSectionIntro } from '@/components/questions/question-editor-section-intro';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  formatExpectedConcepts,
  formatRedFlags,
  parseExpectedConcepts,
  parseRedFlags,
} from '@/features/questions/editor';

import type { QuestionEditorFormProps } from './question-editor-form.types';

type Props = Pick<QuestionEditorFormProps, 'value' | 'submitting' | 'onUpdate'>;

export function QuestionEditorRubricSection({ value, submitting, onUpdate }: Props) {
  return (
    <Card className="border-white/65 bg-white/88 shadow-soft">
      <CardContent className="space-y-6 px-8 py-8">
        <QuestionEditorSectionIntro
          title="Evaluation rubric"
          description="Define what a good answer must cover and which signals should reduce confidence."
          icon={<WandSparkles className="size-4" />}
        />

        <div className="grid gap-6 xl:grid-cols-2">
          <QuestionEditorField
            htmlFor="expectedConcepts"
            label="Expected concepts"
            hint="Format: id | label | weight | description"
          >
            <Textarea
              id="expectedConcepts"
              value={formatExpectedConcepts(value.expectedConcepts)}
              onChange={(event) => onUpdate({ expectedConcepts: parseExpectedConcepts(event.target.value) })}
              placeholder="id | label | weight | description"
              disabled={submitting}
              className="min-h-[220px] rounded-[1.5rem] border-white/70 bg-[hsl(var(--surface-low)/0.8)] px-4 py-3 font-mono text-sm leading-7"
            />
          </QuestionEditorField>

          <QuestionEditorField htmlFor="redFlags" label="Red flags" hint="Format: id | label | severity">
            <Textarea
              id="redFlags"
              value={formatRedFlags(value.redFlags)}
              onChange={(event) => onUpdate({ redFlags: parseRedFlags(event.target.value) })}
              placeholder="id | label | severity"
              disabled={submitting}
              className="min-h-[220px] rounded-[1.5rem] border-white/70 bg-[hsl(var(--surface-low)/0.8)] px-4 py-3 font-mono text-sm leading-7"
            />
          </QuestionEditorField>
        </div>
      </CardContent>
    </Card>
  );
}
