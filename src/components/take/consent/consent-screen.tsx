import { ListVideo, RefreshCw } from 'lucide-react';

import { EyebrowBadge } from '@/components/ui/eyebrow-badge';
import { SurfaceCard } from '@/components/ui/surface-card';
import { PageMainViewport } from '@/components/layout/page-shell';
import { TakeCapabilityCards } from './consent-capability-cards';
import { TakeConsentCheckboxBlock } from './consent-checkbox-block';
import { Panel } from '@/components/ui/panel';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CardContent, CardTitle } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Grid, Stack } from '@/components/ui/layout';
import { Inline } from '@/components/ui/layout/inline';
import { Icon } from '@/components/ui/icon';
import { TextList, TextListItem } from '@/components/ui/text-list';
import { Text } from '@/components/ui/text';
import type { InterviewDataView } from '@/components/take/types';
import { formatTakeQuestionCountLabel, takeMessage } from '@/features/take';

interface TakeConsentScreenProps {
  interview: InterviewDataView;
  consent: boolean;
  setupError: string;
  sessionSyncError?: string | null;
  continueDisabled?: boolean;
  onConsentChange: (checked: boolean) => void;
  onContinueToLobby: () => void;
  onRetrySessionSync?: () => void;
}

export function TakeConsentScreen({
  interview,
  consent,
  setupError,
  sessionSyncError = null,
  continueDisabled = false,
  onConsentChange,
  onContinueToLobby,
  onRetrySessionSync,
}: TakeConsentScreenProps) {
  return (
    <PageMainViewport>
      <SurfaceCard tone="glassFloat" grow="fill" size="lg">
        <CardContent layout="fill-column" spacing="xl">
          <EyebrowBadge icon={<ListVideo size={14} strokeWidth={2} />}>{takeMessage('consentEyebrow')}</EyebrowBadge>
          <Grid columns="consent-shell" gap={10} grow="fill">
            <Stack gap={5} height="full">
              <Stack gap={3}>
                <Heading variant="sectionHeroTitle">
                  {takeMessage('consentInterviewFor').replace('{position}', interview.position)}
                </Heading>
                <Text variant="heroDescription">
                  {takeMessage('consentWelcome')
                    .replace('{candidateName}', interview.candidateName)
                    .replace('{questionCount}', formatTakeQuestionCountLabel(interview.totalQuestions))}
                </Text>
              </Stack>
              <TakeCapabilityCards />
            </Stack>

            <Stack gap={5} height="full">
              <Stack gap={2}>
                <CardTitle size="lg">{takeMessage('consentBeforeStart')}</CardTitle>
                <Text variant="bodyMutedSm">{takeMessage('consentPrepHint')}</Text>
              </Stack>
              <Stack gap={5}>
                <Panel radius="lg" padding="lg">
                  <Stack gap={3}>
                    <Text as="span" variant="eyebrowLabel">
                      {takeMessage('consentDataCollected')}
                    </Text>
                    <TextList>
                      <TextListItem>
                        <Text variant="bodyMutedSm">{takeMessage('consentDataCameraMic')}</Text>
                      </TextListItem>
                      <TextListItem>
                        <Text variant="bodyMutedSm">
                          {takeMessage('consentDataScreen')}
                        </Text>
                      </TextListItem>
                      <TextListItem>
                        <Text variant="bodyMutedSm">{takeMessage('consentDataBrowser')}</Text>
                      </TextListItem>
                      <TextListItem>
                        <Text variant="bodyMutedSm">{takeMessage('consentDataMetadata')}</Text>
                      </TextListItem>
                    </TextList>
                  </Stack>
                </Panel>

                {sessionSyncError && onRetrySessionSync ? (
                  <Alert variant="danger">
                    <AlertTitle>{takeMessage('sessionSyncFailedTitle')}</AlertTitle>
                    <AlertDescription>
                      <Inline gap={3} align="center" wrap="wrap">
                        <span>{sessionSyncError}</span>
                        <Button
                          type="button"
                          variant="outline-pill"
                          shape="pill"
                          size="sm"
                          onClick={onRetrySessionSync}
                        >
                          <Icon size="sm">
                            <RefreshCw />
                          </Icon>
                          {takeMessage('retry')}
                        </Button>
                      </Inline>
                    </AlertDescription>
                  </Alert>
                ) : null}

                {setupError ? (
                  <Alert variant="destructive">
                    <AlertTitle>{takeMessage('setupIncomplete')}</AlertTitle>
                    <AlertDescription>{setupError}</AlertDescription>
                  </Alert>
                ) : null}

                <TakeConsentCheckboxBlock consent={consent} onConsentChange={onConsentChange} />

                <Stack width="full">
                  <Button
                    type="button"
                    disabled={!consent || continueDisabled}
                    onClick={onContinueToLobby}
                    variant="gradient"
                    size="2xl"
                    shape="rounded"
                  >
                    {takeMessage('consentContinue')}
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </Grid>
        </CardContent>
      </SurfaceCard>
    </PageMainViewport>
  );
}
