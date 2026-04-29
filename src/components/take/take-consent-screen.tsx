import { Sparkles } from 'lucide-react';

import { EyebrowBadge } from '@/components/app/eyebrow-badge';
import { SurfaceCard, SurfaceCardMax5xl } from '@/components/app/surface-card';
import { BodyMutedSm, EyebrowLabel, HeroDescription, HeroTitle, SectionCardTitle } from '@/components/layout/content-presets';
import { PageMain } from '@/components/layout/page-shell';
import { TakeCapabilityCards } from '@/components/take/consent/take-capability-cards';
import { TakeConsentCheckboxBlock } from '@/components/take/consent/take-consent-checkbox-block';
import { TakePermissionStatusList } from '@/components/take/consent/take-permission-status-list';
import { TakePanel } from '@/components/take/take-panel';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader } from '@/components/ui/card';
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
    <PageMain>
      <SurfaceCardMax5xl tone="glassFloat">
        <CardContent className="grid gap-8 px-8 py-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <EyebrowBadge icon={<Sparkles className="size-3.5" />}>Candidate interview</EyebrowBadge>

            <div className="space-y-3">
              <HeroTitle>Interview for {interview.position}</HeroTitle>
              <HeroDescription>
                Welcome, {interview.candidateName}. You will answer {interview.totalQuestions}{' '}
                questions, with up to four minutes for each response.
              </HeroDescription>
            </div>

            <TakeCapabilityCards />
          </div>

          <SurfaceCard tone="glassSoft">
            <CardHeader className="space-y-2">
              <SectionCardTitle>Before you start</SectionCardTitle>
              <CardDescription className="text-sm leading-6">
                One button will request camera, microphone, and then full-screen sharing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <TakePanel radius="lg" padding="lg" className="space-y-3">
                <EyebrowLabel>Data collected</EyebrowLabel>
                <ul className="space-y-2">
                  <li>
                    <BodyMutedSm>Camera video and microphone audio for each answer</BodyMutedSm>
                  </li>
                  <li>
                    <BodyMutedSm>Full-monitor screen recording in parallel with each answer</BodyMutedSm>
                  </li>
                  <li>
                    <BodyMutedSm>Browser activity such as tab switches</BodyMutedSm>
                  </li>
                  <li>
                    <BodyMutedSm>Session metadata including answer timing</BodyMutedSm>
                  </li>
                </ul>
              </TakePanel>

              <TakePermissionStatusList
                cameraStatus={cameraStatus}
                screenStatus={screenStatus}
                screenSurface={screenSurface}
                permissionLabel={permissionLabel}
                permissionClasses={permissionClasses}
              />

              {setupError ? (
                <Alert variant="destructive">
                  <AlertTitle>Setup incomplete</AlertTitle>
                  <AlertDescription>{setupError}</AlertDescription>
                </Alert>
              ) : null}

              <TakeConsentCheckboxBlock consent={consent} onConsentChange={onConsentChange} />

              <Button
                type="button"
                disabled={!consent || setupBusy}
                onClick={onStartInterview}
                variant="gradient"
                size="full"
              >
                {setupBusy ? 'Requesting access...' : 'Allow Camera, Mic & Entire Screen'}
              </Button>
            </CardContent>
          </SurfaceCard>
        </CardContent>
      </SurfaceCardMax5xl>
    </PageMain>
  );
}
