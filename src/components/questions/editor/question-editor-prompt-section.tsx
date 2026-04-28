import { Sparkles } from 'lucide-react';

import { QuestionEditorField } from '@/components/questions/question-editor-field';
import { QuestionEditorSectionIntro } from '@/components/questions/question-editor-section-intro';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { joinStringList, parseStringList } from '@/features/questions/editor';

import type { QuestionEditorFormProps } from './question-editor-form.types';

type Props = Pick<QuestionEditorFormProps, 'value' | 'submitting' | 'onUpdate'>;

export function QuestionEditorPromptSection({ value, submitting, onUpdate }: Props) {
  return (
    <Card className="border-white/65 bg-white/88 shadow-soft">
      <CardContent className="space-y-6 px-8 py-8">
        <QuestionEditorSectionIntro
          title="Prompt and follow-up"
          description="Write the core question clearly, then capture the follow-up probes that interviewers should keep ready."
          icon={<Sparkles className="size-4" />}
        />

        <QuestionEditorField htmlFor="questionText" label="Question text">
          <Textarea
            id="questionText"
            value={value.questionText}
            onChange={(event) => onUpdate({ questionText: event.target.value })}
            placeholder="e.g. What is a closure in JavaScript?"
            disabled={submitting}
            className="min-h-[150px] rounded-[1.5rem] border-white/70 bg-[hsl(var(--surface-low)/0.8)] px-4 py-3 text-base leading-7"
          />
        </QuestionEditorField>

        <QuestionEditorField
          htmlFor="followUpQuestions"
          label="Follow-up questions"
          hint="Use one line per probe so the interviewer can keep cadence during the session."
        >
          <Textarea
            id="followUpQuestions"
            value={joinStringList(value.followUpQuestions)}
            onChange={(event) => onUpdate({ followUpQuestions: parseStringList(event.target.value) })}
            placeholder="One question per line"
            disabled={submitting}
            className="min-h-[140px] rounded-[1.5rem] border-white/70 bg-[hsl(var(--surface-low)/0.8)] px-4 py-3 leading-7"
          />
        </QuestionEditorField>
      </CardContent>
    </Card>
  );
}
