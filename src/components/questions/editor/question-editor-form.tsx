import { BrainCircuit, Save, Sparkles, WandSparkles } from 'lucide-react';
import type { FormEvent } from 'react';

import { SurfaceCard } from '@/components/app/surface-card';
import { CardContentSpacious } from '@/components/layout/content-presets';
import { QuestionEditorField } from '@/components/questions/question-editor-field';
import { QuestionEditorSectionIntro } from '@/components/questions/question-editor-section-intro';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  formatExpectedConcepts,
  formatRedFlags,
  joinStringList,
  parseExpectedConcepts,
  parseRedFlags,
  parseStringList,
} from '@/features/questions/editor';
import type { QuestionDifficulty, QuestionInput } from '@/lib/api';

interface QuestionEditorFormProps {
  value: QuestionInput;
  metadataText: string;
  setMetadataText: (value: string) => void;
  submitting: boolean;
  submitLabel: string;
  onUpdate: (patch: Partial<QuestionInput>) => void;
  onSubmit: (event: FormEvent) => void;
}

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
      <SurfaceCard tone="glassSoft">
        <CardContentSpacious>
          <QuestionEditorSectionIntro
            title="Question identity"
            description="Anchor the prompt in the role and taxonomy you expect recruiters to search later."
            icon={<BrainCircuit className="size-4" />}
          />

          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
            <QuestionEditorField
              htmlFor="externalId"
              label="External ID"
              hint="Optional stable identifier for imports."
            >
              <Input
                id="externalId"
                value={value.externalId ?? ''}
                onChange={(event) => onUpdate({ externalId: event.target.value })}
                placeholder="frontend_closure_v1"
                disabled={submitting}
                className="h-11 rounded-2xl border-white/70 bg-[hsl(var(--surface-low)/0.8)]"
              />
            </QuestionEditorField>

            <QuestionEditorField htmlFor="role" label="Role">
              <Input
                id="role"
                value={value.role ?? ''}
                onChange={(event) => onUpdate({ role: event.target.value })}
                placeholder="frontend intern"
                disabled={submitting}
                className="h-11 rounded-2xl border-white/70 bg-[hsl(var(--surface-low)/0.8)]"
              />
            </QuestionEditorField>

            <QuestionEditorField htmlFor="focus" label="Focus">
              <Input
                id="focus"
                value={value.focus ?? ''}
                onChange={(event) => onUpdate({ focus: event.target.value })}
                placeholder="fundamentals"
                disabled={submitting}
                className="h-11 rounded-2xl border-white/70 bg-[hsl(var(--surface-low)/0.8)]"
              />
            </QuestionEditorField>

            <QuestionEditorField htmlFor="outputLanguage" label="Output language">
              <Input
                id="outputLanguage"
                value={value.outputLanguage}
                onChange={(event) => onUpdate({ outputLanguage: event.target.value })}
                placeholder="English"
                disabled={submitting}
                className="h-11 rounded-2xl border-white/70 bg-[hsl(var(--surface-low)/0.8)]"
              />
            </QuestionEditorField>
          </div>

          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-5">
            <QuestionEditorField htmlFor="category" label="Category">
              <Input
                id="category"
                value={value.category ?? ''}
                onChange={(event) => onUpdate({ category: event.target.value })}
                placeholder="javascript"
                disabled={submitting}
                className="h-11 rounded-2xl border-white/70 bg-[hsl(var(--surface-low)/0.8)]"
              />
            </QuestionEditorField>

            <QuestionEditorField htmlFor="subcategory" label="Subcategory">
              <Input
                id="subcategory"
                value={value.subcategory ?? ''}
                onChange={(event) => onUpdate({ subcategory: event.target.value })}
                placeholder="closures"
                disabled={submitting}
                className="h-11 rounded-2xl border-white/70 bg-[hsl(var(--surface-low)/0.8)]"
              />
            </QuestionEditorField>

            <QuestionEditorField htmlFor="difficulty" label="Difficulty">
              <Select
                value={value.difficulty}
                onValueChange={(next) => onUpdate({ difficulty: next as QuestionDifficulty })}
                disabled={submitting}
              >
                <SelectTrigger className="h-11 w-full rounded-2xl border-white/70 bg-[hsl(var(--surface-low)/0.8)] px-4">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">easy</SelectItem>
                  <SelectItem value="medium">medium</SelectItem>
                  <SelectItem value="hard">hard</SelectItem>
                </SelectContent>
              </Select>
            </QuestionEditorField>

            <QuestionEditorField htmlFor="weight" label="Weight">
              <Input
                id="weight"
                type="number"
                min={0.1}
                max={10}
                step={0.1}
                value={value.weight}
                onChange={(event) => onUpdate({ weight: Math.max(0.1, Number(event.target.value) || 1) })}
                disabled={submitting}
                className="h-11 rounded-2xl border-white/70 bg-[hsl(var(--surface-low)/0.8)]"
              />
            </QuestionEditorField>

            <QuestionEditorField htmlFor="minimumPassScore" label="Minimum pass score">
              <Input
                id="minimumPassScore"
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={value.minimumPassScore}
                onChange={(event) =>
                  onUpdate({
                    minimumPassScore: Math.max(0, Math.min(5, Number(event.target.value) || 0)),
                  })
                }
                disabled={submitting}
                className="h-11 rounded-2xl border-white/70 bg-[hsl(var(--surface-low)/0.8)]"
              />
            </QuestionEditorField>
          </div>
        </CardContentSpacious>
      </SurfaceCard>

      <SurfaceCard tone="glassSoft">
        <CardContentSpacious>
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
        </CardContentSpacious>
      </SurfaceCard>

      <SurfaceCard tone="glassSoft">
        <CardContentSpacious>
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
        </CardContentSpacious>
      </SurfaceCard>

      <SurfaceCard tone="glassSoft">
        <CardContentSpacious>
          <QuestionEditorSectionIntro
            title="Reference material"
            description="Store extra context for future reviewers, exports, and scoring experiments."
            icon={<Save className="size-4" />}
          />

          <div className="grid gap-6 xl:grid-cols-2">
            <QuestionEditorField
              htmlFor="sampleGoodAnswer"
              label="Sample good answer"
              hint="Target depth reference for evaluation."
            >
              <Textarea
                id="sampleGoodAnswer"
                value={value.sampleGoodAnswer ?? ''}
                onChange={(event) => onUpdate({ sampleGoodAnswer: event.target.value })}
                placeholder="Target depth reference for evaluation"
                disabled={submitting}
                className="min-h-[220px] rounded-[1.5rem] border-white/70 bg-[hsl(var(--surface-low)/0.8)] px-4 py-3 leading-7"
              />
            </QuestionEditorField>

            <div className="space-y-6">
              <QuestionEditorField
                htmlFor="tags"
                label="Tags"
                hint="Comma or newline separated tags used for filtering and imports."
              >
                <Textarea
                  id="tags"
                  value={joinStringList(value.tags)}
                  onChange={(event) => onUpdate({ tags: parseStringList(event.target.value) })}
                  placeholder="Comma or newline separated"
                  disabled={submitting}
                  className="min-h-[120px] rounded-[1.5rem] border-white/70 bg-[hsl(var(--surface-low)/0.8)] px-4 py-3 leading-7"
                />
              </QuestionEditorField>

              <QuestionEditorField
                htmlFor="metadata"
                label="Additional metadata"
                hint="Valid JSON object that can carry rubric or source information."
              >
                <Textarea
                  id="metadata"
                  value={metadataText}
                  onChange={(event) => setMetadataText(event.target.value)}
                  placeholder='{"rubricVersion":"v1"}'
                  disabled={submitting}
                  className="min-h-[180px] rounded-[1.5rem] border-white/70 bg-[hsl(var(--surface-low)/0.8)] px-4 py-3 font-mono text-sm leading-7"
                />
              </QuestionEditorField>
            </div>
          </div>
        </CardContentSpacious>
      </SurfaceCard>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.75rem] border border-white/65 bg-white/88 px-6 py-5 shadow-soft">
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Saving preserves the current rubric state exactly as shown above. AI proposals are only
          persisted after you explicitly apply them.
        </p>
        <Button
          type="submit"
          disabled={submitting}
          variant="gradient"
        >
          <Save className="size-4" />
          {submitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
