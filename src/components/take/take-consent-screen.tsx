import { Sparkles } from 'lucide-react';

import { EyebrowBadge } from '@/components/app/eyebrow-badge';
import { SurfaceCard, SurfaceCardMax5xl } from '@/components/app/surface-card';
import type { StatusTone } from '@/components/app/status-pill';
import { PageMain } from '@/components/layout/page-shell';
import { TakeCapabilityCards } from '@/components/take/consent/take-capability-cards';
import { TakeConsentCheckboxBlock } from '@/components/take/consent/take-consent-checkbox-block';
import { TakePermissionStatusList } from '@/components/take/consent/take-permission-status-list';
import { TakePanel } from '@/components/take/take-panel';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
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
  permissionTone: (status: PermissionStatus) => StatusTone;
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
  permissionTone,
}: TakeConsentScreenProps) {
  return (
    <PageMain>
      <SurfaceCardMax5xl tone="glassFloat">
        <CardContent layout="spacious">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <EyebrowBadge icon={<Sparkles className="size-3.5" />}>Candidate interview</EyebrowBadge>

              <div className="space-y-3">
                <Heading variant="heroTitle">Interview for {interview.position}</Heading>
                <Text variant="heroDescription">
                  Welcome, {interview.candidateName}. You will answer {interview.totalQuestions}{' '}
                  questions, with up to four minutes for each response.
                </Text>
              </div>

              <TakeCapabilityCards />
            </div>

            <SurfaceCard tone="glassSoft">
              <CardHeader>
                <div className="space-y-2">
                  <CardTitle size="section">Before you start</CardTitle>
                  <Text variant="bodyMutedSm">
                    One button will request camera, microphone, and then full-screen sharing.
                  </Text>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  <TakePanel radius="lg" padding="lg">
                    <div className="space-y-3">
                      <Text as="span" variant="eyebrowLabel">
                        Data collected
                      </Text>
                      <ul className="space-y-2">
                        <li>
                          <Text variant="bodyMutedSm">Camera video and microphone audio for each answer</Text>
                        </li>
                        <li>
                          <Text variant="bodyMutedSm">
                            Full-monitor screen recording in parallel with each answer
                          </Text>
                        </li>
                        <li>
                          <Text variant="bodyMutedSm">Browser activity such as tab switches</Text>
                        </li>
                        <li>
                          <Text variant="bodyMutedSm">Session metadata including answer timing</Text>
                        </li>
                      </ul>
                    </div>
                  </TakePanel>

                  <TakePermissionStatusList
                    cameraStatus={cameraStatus}
                    screenStatus={screenStatus}
                    screenSurface={screenSurface}
                    permissionLabel={permissionLabel}
                    permissionTone={permissionTone}
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
                </div>
              </CardContent>
            </SurfaceCard>
          </div>
        </CardContent>
      </SurfaceCardMax5xl>
    </PageMain>
  );
}
