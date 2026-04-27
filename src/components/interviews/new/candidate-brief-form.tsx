import { ArrowRight, BriefcaseBusiness, UserRound } from 'lucide-react';

import { MetricPanel } from '@/components/app/metric-panel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CandidateBriefFormProps {
  candidateName: string;
  position: string;
  submitting: boolean;
  loadingQuestions: boolean;
  questionsCount: number;
  onCandidateNameChange: (value: string) => void;
  onPositionChange: (value: string) => void;
}

export function CandidateBriefForm({
  candidateName,
  position,
  submitting,
  loadingQuestions,
  questionsCount,
  onCandidateNameChange,
  onPositionChange,
}: CandidateBriefFormProps) {
  return (
    <Card className="border-white/65 bg-white/88 shadow-soft">
      <CardHeader>
        <CardTitle className="text-2xl tracking-[-0.03em]">Candidate brief</CardTitle>
        <CardDescription className="text-sm leading-6">
          This metadata will anchor the scoring context once answers arrive.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="candidateName">Candidate name</Label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="candidateName"
              value={candidateName}
              onChange={(event) => onCandidateNameChange(event.target.value)}
              placeholder="e.g. Jane Doe"
              disabled={submitting}
              className="h-11 rounded-2xl border-white/70 bg-[hsl(var(--surface-low)/0.8)] pl-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <div className="relative">
            <BriefcaseBusiness className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="position"
              value={position}
              onChange={(event) => onPositionChange(event.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              disabled={submitting}
              className="h-11 rounded-2xl border-white/70 bg-[hsl(var(--surface-low)/0.8)] pl-11"
            />
          </div>
        </div>

        <MetricPanel
          label="Ready to send"
          description="Once the interview is created, the candidate flow can start uploading answers immediately against this curated question packet."
          value={null}
          valueClassName="mt-0"
        />
        <div>
          <Button
            type="submit"
            disabled={submitting || loadingQuestions || questionsCount === 0}
            className="mt-5 w-full rounded-2xl bg-primary-gradient shadow-soft hover:brightness-105"
          >
            {submitting ? 'Creating...' : 'Create Interview'}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
