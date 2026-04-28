import { Sparkles } from 'lucide-react';

import { EyebrowBadge } from '@/components/app/eyebrow-badge';
import { TakeCapabilityCards } from '@/components/take/consent/take-capability-cards';
import { TakeConsentCheckboxBlock } from '@/components/take/consent/take-consent-checkbox-block';
import { TakePermissionStatusList } from '@/components/take/consent/take-permission-status-list';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { InterviewDataView, PermissionStatus } from '@/components/take/types';

interface TakeConsentScreenProps {
  interview: InterviewDataView;
  cameraStatus: PermissionStatus;
  screenStatus: PermissionStatus;
  screenSurface: string;
  consent: boolean;
  setupBusy: boolean;
  setupError: string;
  onConsentChange: (checked: boolean) => void;
  onStartInterview: () => void;
  permissionLabel: (status: PermissionStatus) => string;
  permissionClasses: (status: PermissionStatus) => string;
}

export function TakeConsentScreen({
  interview,
  cameraStatus,
  screenStatus,
  screenSurface,
  consent,
  setupBusy,
  setupError,
  onConsentChange,
  onStartInterview,
  permissionLabel,
  permissionClasses,
}: TakeConsentScreenProps) {
  return (
    <main className="container space-y-8 py-10 md:py-12">
      <Card className="mx-auto max-w-5xl border-white/65 bg-white/88 shadow-float">
        <CardContent className="grid gap-8 px-8 py-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <EyebrowBadge icon={<Sparkles className="size-3.5" />}>Candidate interview</EyebrowBadge>

            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl">
                Interview for {interview.position}
              </h1>
              <p className="text-base leading-7 text-muted-foreground md:text-lg">
                Welcome, {interview.candidateName}. You will answer {interview.totalQuestions}{' '}
                questions, with up to four minutes for each response.
              </p>
            </div>

            <TakeCapabilityCards />
          </div>

          <Card className="border-white/70 bg-white/90 shadow-soft">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl tracking-[-0.03em]">Before you start</CardTitle>
              <CardDescription className="text-sm leading-6">
                One button will request camera, microphone, and then full-screen sharing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3 rounded-[1.5rem] bg-[hsl(var(--surface-low)/0.85)] p-5 ring-1 ring-border/45">
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Data collected
                </div>
                <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                  <li>Camera video and microphone audio for each answer</li>
                  <li>Full-monitor screen recording in parallel with each answer</li>
                  <li>Browser activity such as tab switches</li>
                  <li>Session metadata including answer timing</li>
                </ul>
              </div>

              <TakePermissionStatusList
                cameraStatus={cameraStatus}
                screenStatus={screenStatus}
                screenSurface={screenSurface}
                permissionLabel={permissionLabel}
                permissionClasses={permissionClasses}
              />

              {setupError ? (
                <Alert variant="destructive" className="border-rose-200/70 bg-rose-50/85">
                  <AlertTitle>Setup incomplete</AlertTitle>
                  <AlertDescription>{setupError}</AlertDescription>
                </Alert>
              ) : null}

              <TakeConsentCheckboxBlock consent={consent} onConsentChange={onConsentChange} />

              <Button
                type="button"
                disabled={!consent || setupBusy}
                onClick={onStartInterview}
                className="h-11 w-full rounded-2xl bg-primary-gradient shadow-soft hover:brightness-105"
              >
                {setupBusy ? 'Requesting access...' : 'Allow Camera, Mic & Entire Screen'}
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </main>
  );
}
