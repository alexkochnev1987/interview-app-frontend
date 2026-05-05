import { Sparkles } from 'lucide-react';

import { EyebrowBadge } from '@/components/ui/eyebrow-badge';
import { SurfaceCard, SurfaceCardMax5xl } from '@/components/ui/surface-card';
import type { StatusTone } from '@/components/ui/status-pill';
import { PageMain } from '@/components/layout/page-shell';
import { TakeCapabilityCards } from '@/components/take/consent/take-capability-cards';
import { TakeConsentCheckboxBlock } from '@/components/take/consent/take-consent-checkbox-block';
import { TakePermissionStatusList } from '@/components/take/consent/take-permission-status-list';
import { TakePanel } from '@/components/take/take-panel';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Grid, Stack } from '@/components/ui/layout';
import { TextList, TextListItem } from '@/components/ui/text-list';
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
        <CardContent layout="fill-column" spacing="xl">
          <Grid columns="consent-shell" gap={8}>
            <Stack gap={5}>
              <EyebrowBadge icon={<Sparkles size={14} />}>Candidate interview</EyebrowBadge>

              <Stack gap={3}>
                <Heading variant="heroTitle">Interview for {interview.position}</Heading>
                <Text variant="heroDescription">
                  Welcome, {interview.candidateName}. You will answer {interview.totalQuestions}{' '}
                  questions, with up to four minutes for each response.
                </Text>
              </Stack>

              <TakeCapabilityCards />
            </Stack>

            <SurfaceCard tone="glassSoft">
              <CardHeader>
                <Stack gap={2}>
                  <CardTitle size="lg">Before you start</CardTitle>
                  <Text variant="bodyMutedSm">
                    One button will request camera, microphone, and then full-screen sharing.
                  </Text>
                </Stack>
              </CardHeader>
              <CardContent>
                <Stack gap={5}>
                  <TakePanel radius="lg" padding="lg">
                    <Stack gap={3}>
                      <Text as="span" variant="eyebrowLabel">
                        Data collected
                      </Text>
                      <TextList>
                        <TextListItem>
                          <Text variant="bodyMutedSm">Camera video and microphone audio for each answer</Text>
                        </TextListItem>
                        <TextListItem>
                          <Text variant="bodyMutedSm">
                            Full-monitor screen recording in parallel with each answer
                          </Text>
                        </TextListItem>
                        <TextListItem>
                          <Text variant="bodyMutedSm">Browser activity such as tab switches</Text>
                        </TextListItem>
                        <TextListItem>
                          <Text variant="bodyMutedSm">Session metadata including answer timing</Text>
                        </TextListItem>
                      </TextList>
                    </Stack>
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

                  <Stack width="full">
                    <Button
                      type="button"
                      disabled={!consent || setupBusy}
                      onClick={onStartInterview}
                      variant="gradient"
                      size="2xl"
                      shape="rounded"
                    >
                      {setupBusy ? 'Requesting access...' : 'Allow Camera, Mic & Entire Screen'}
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </SurfaceCard>
          </Grid>
        </CardContent>
      </SurfaceCardMax5xl>
    </PageMain>
  );
}
