import { CircleAlert, Upload } from 'lucide-react';

import { StatusPill } from '@/components/app/status-pill';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatAnswerDuration, formatFileSize } from '@/features/interviews/detail-formatters';
import type { Interview } from '@/lib/api';
import { cn } from '@/lib/utils';

interface UploadState {
  status: 'idle' | 'uploading' | 'uploaded' | 'error';
  errorMessage?: string;
}

interface InterviewQuestionCardProps {
  question: Interview['questions'][number];
  questionIndex: number;
  answer: Interview['answers'][number] | undefined;
  uploadState: UploadState;
  isTerminal: boolean;
  interviewStatus: Interview['status'];
  onUploadClick: () => void;
  onFileChange: () => void;
  setFileInputRef: (element: HTMLInputElement | null) => void;
}

export function InterviewQuestionCard({
  question,
  questionIndex,
  answer,
  uploadState,
  isTerminal,
  interviewStatus,
  onUploadClick,
  onFileChange,
  setFileInputRef,
}: InterviewQuestionCardProps) {
  const hasAnswer = Boolean(answer);

  return (
    <Card className="border-white/65 bg-white/88 shadow-soft transition-transform duration-200 hover:-translate-y-0.5">
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone="neutral">Q{questionIndex + 1}</StatusPill>
              <StatusPill tone={question.difficulty}>{question.difficulty}</StatusPill>
              {question.category ? (
                <StatusPill tone="neutral" className="normal-case tracking-[0.08em]">
                  {question.category}
                </StatusPill>
              ) : null}
              <StatusPill tone="neutral">weight {question.weight}</StatusPill>
            </div>
            <CardTitle className="max-w-4xl text-xl tracking-[-0.03em]">{question.questionText}</CardTitle>
          </div>

          <div className="flex flex-col items-end gap-2">
            {answer?.status === 'submitted' ? (
              <StatusPill tone="completed">Submitted</StatusPill>
            ) : hasAnswer || uploadState.status === 'uploaded' ? (
              <StatusPill tone="processing">Draft saved</StatusPill>
            ) : uploadState.status === 'uploading' ? (
              <StatusPill tone="processing">Uploading</StatusPill>
            ) : uploadState.status === 'error' ? (
              <StatusPill tone="failed">Upload failed</StatusPill>
            ) : (
              <StatusPill tone="pending">Pending</StatusPill>
            )}

            {!isTerminal && interviewStatus !== 'processing' ? (
              <>
                <input
                  type="file"
                  accept="video/*,audio/*"
                  ref={setFileInputRef}
                  className="hidden"
                  onChange={onFileChange}
                />
                <Button
                  type="button"
                  variant={uploadState.status === 'error' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={onUploadClick}
                  className={cn(
                    'rounded-full bg-white/75',
                    uploadState.status === 'error' && 'bg-rose-50 hover:bg-rose-100',
                  )}
                >
                  <Upload className="size-4" />
                  {uploadState.status === 'error' ? 'Retry upload' : 'Upload file'}
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {answer ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.25rem] bg-[hsl(var(--surface-low)/0.85)] p-4 ring-1 ring-border/45">
              <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Recorded answer
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Duration {formatAnswerDuration(answer.durationSeconds)} • retakes {answer.retakeCount ?? 0}
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Camera {formatFileSize(answer.camera?.fileSizeBytes)} • screen {formatFileSize(answer.screen?.fileSizeBytes)}
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Status {answer.status} • versions {answer.versions?.length ?? 1}
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Uploaded {new Date(answer.uploadedAt).toLocaleString()}
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-[hsl(var(--surface-low)/0.85)] p-4 ring-1 ring-border/45">
              <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Evaluation signals
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Hidden tabs {answer.behaviorSignals?.tabHiddenCount ?? 0} • blur {answer.behaviorSignals?.windowBlurCount ?? 0} • paste {answer.behaviorSignals?.pasteCount ?? 0}
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Keydown {answer.behaviorSignals?.keydownCount ?? 0} • resize {answer.behaviorSignals?.resizeCount ?? 0}
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Transcript {answer.transcript?.text ? 'ready' : 'pending'} • evaluation {answer.evaluation?.overallScore !== undefined ? 'ready' : 'pending'}
              </p>
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.25rem] bg-[hsl(var(--surface-low)/0.85)] p-4 ring-1 ring-border/45">
            <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Expected concepts
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {question.expectedConcepts.length > 0
                ? question.expectedConcepts.map((item) => item.label).join(', ')
                : 'Not specified'}
            </p>
          </div>
          <div className="rounded-[1.25rem] bg-[hsl(var(--surface-low)/0.85)] p-4 ring-1 ring-border/45">
            <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Red flags
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {question.redFlags.length > 0
                ? question.redFlags.map((item) => item.label).join(', ')
                : 'Not specified'}
            </p>
          </div>
        </div>

        {uploadState.status === 'error' && uploadState.errorMessage ? (
          <Alert variant="destructive" className="border-rose-200/70 bg-rose-50/85">
            <CircleAlert className="size-4" />
            <AlertTitle>Upload error</AlertTitle>
            <AlertDescription>{uploadState.errorMessage}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
