import { ListVideo } from 'lucide-react';

import { EyebrowBadge } from '@/components/ui/eyebrow-badge';
import { SurfaceCard } from '@/components/ui/surface-card';
import { PageMainViewport } from '@/components/layout/page-shell';
import { TakeCapabilityCards } from '@/components/take/consent/take-capability-cards';
import { TakeConsentCheckboxBlock } from '@/components/take/consent/take-consent-checkbox-block';
import { TakePanel } from '@/components/take/take-panel';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Grid, Stack } from '@/components/ui/layout';
import { TextList, TextListItem } from '@/components/ui/text-list';
import { Text } from '@/components/ui/text';
import type { InterviewDataView } from '@/components/take/types';
import { formatTakeQuestionCountLabel, TAKE_MESSAGES } from '@/features/take';

interface TakeConsentScreenProps {
  interview: InterviewDataView;
  consent: boolean;
  setupError: string;
  onConsentChange: (checked: boolean) => void;
  onContinueToLobby: () => void;
}

export function TakeConsentScreen({
  interview,
  consent,
  setupError,
  onConsentChange,
  onContinueToLobby,
}: TakeConsentScreenProps) {
  return (
    <PageMainViewport>
      <SurfaceCard tone="glassFloat" grow="fill">
        <CardContent layout="fill-column" spacing="xl">
          <Grid columns="consent-shell" gap={8} grow="fill">
            <Stack gap={5} height="full" >
              <Stack gap={5}>
                <EyebrowBadge icon={<ListVideo size={14} strokeWidth={2} />}>Candidate interview</EyebrowBadge>

                <Stack gap={3}>
                  <Heading variant="sectionHeroTitle">Interview for {interview.position}</Heading>
                  <Text variant="heroDescription">
                    Welcome, <strong>{interview.candidateName}</strong>. You will answer{' '}
                    {formatTakeQuestionCountLabel(interview.totalQuestions)}, with up to four minutes for each response.
                  </Text>
                </Stack>
              </Stack>

              <TakeCapabilityCards />
            </Stack>

            <SurfaceCard tone="glassSoftFlat" height="full">
              <CardHeader>
                <Stack gap={2}>
                  <CardTitle size="lg">Before you start</CardTitle>
                  <Text variant="bodyMutedSm">{TAKE_MESSAGES.consentPrepHint}</Text>
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
                      disabled={!consent}
                      onClick={onContinueToLobby}
                      variant="gradient"
                      size="2xl"
                      shape="rounded"
                    >
                      {TAKE_MESSAGES.consentContinue}
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </SurfaceCard>
          </Grid>
        </CardContent>
      </SurfaceCard>
    </PageMainViewport>
  );
}
