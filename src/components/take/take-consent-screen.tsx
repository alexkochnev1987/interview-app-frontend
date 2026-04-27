import { Camera, Mic, ShieldCheck, Sparkles, Video } from 'lucide-react';

import { EyebrowBadge } from '@/components/app/eyebrow-badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card className="border-white/60 bg-[hsl(var(--surface-low)/0.9)] shadow-soft">
                <CardContent className="space-y-3 px-5 py-5">
                  <Camera className="size-5 text-[hsl(var(--primary))]" />
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-foreground">Camera</div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Recorded separately for every answer.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/60 bg-[hsl(var(--surface-low)/0.9)] shadow-soft">
                <CardContent className="space-y-3 px-5 py-5">
                  <Mic className="size-5 text-[hsl(var(--primary))]" />
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-foreground">Microphone</div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Captured together with your camera feed.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/60 bg-[hsl(var(--surface-low)/0.9)] shadow-soft">
                <CardContent className="space-y-3 px-5 py-5">
                  <Video className="size-5 text-[hsl(var(--primary))]" />
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-foreground">Entire screen</div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Must be shared as <strong>Entire screen</strong>, not a tab or app window.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/60 bg-[hsl(var(--surface-low)/0.9)] shadow-soft">
                <CardContent className="space-y-3 px-5 py-5">
                  <ShieldCheck className="size-5 text-[hsl(var(--primary))]" />
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-foreground">Fairness checks</div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Session and browser activity may be stored for evaluation integrity.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
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

              <div className="space-y-3 rounded-[1.5rem] bg-white/85 p-5 ring-1 ring-border/45">
                <div className="flex items-center justify-between gap-3 rounded-[1rem] bg-[hsl(var(--surface-low)/0.8)] px-4 py-3">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-foreground">Camera and microphone</div>
                    <p className="text-xs leading-5 text-muted-foreground">
                      Required before recording can begin.
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] ring-1 ${permissionClasses(cameraStatus)}`}
                  >
                    {permissionLabel(cameraStatus)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-[1rem] bg-[hsl(var(--surface-low)/0.8)] px-4 py-3">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-foreground">Entire screen share</div>
                    <p className="text-xs leading-5 text-muted-foreground">
                      {screenSurface === 'monitor'
                        ? 'Entire screen is confirmed and ready.'
                        : 'In the share picker, choose Entire screen / Screen.'}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] ring-1 ${permissionClasses(screenStatus)}`}
                  >
                    {permissionLabel(screenStatus)}
                  </span>
                </div>
              </div>

              {setupError ? (
                <Alert variant="destructive" className="border-rose-200/70 bg-rose-50/85">
                  <AlertTitle>Setup incomplete</AlertTitle>
                  <AlertDescription>{setupError}</AlertDescription>
                </Alert>
              ) : null}

              <div className="flex items-start gap-3 rounded-[1.25rem] bg-white/85 p-4 ring-1 ring-border/45">
                <Checkbox
                  id="consent"
                  checked={consent}
                  onCheckedChange={(checked) => onConsentChange(Boolean(checked))}
                  className="mt-1"
                />
                <div className="space-y-2">
                  <Label htmlFor="consent" className="text-sm font-semibold text-foreground">
                    I agree to the recording and data collection terms.
                  </Label>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Data is used only for interview evaluation and is stored for 90 days.
                  </p>
                </div>
              </div>

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
