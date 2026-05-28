import { ListVideo, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

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
import { formatTakeQuestionCountLabel } from '@/features/take';

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
  const tTake = useTranslations('takeFlow');
  return (
    <PageMainViewport>
      <SurfaceCard tone="glassFloat" grow="fill" size="lg">
        <CardContent layout="fill-column" spacing="xl">
          <EyebrowBadge icon={<ListVideo size={14} strokeWidth={2} />}>{tTake('consentEyebrow')}</EyebrowBadge>
          <Grid columns="consent-shell" gap={10} grow="fill">
            <Stack gap={5} height="full">
              <Stack gap={3}>
                <Heading variant="sectionHeroTitle">
                  {tTake('consentInterviewFor', { position: interview.position })}
                </Heading>
                <Text variant="heroDescription">
                  {tTake('consentWelcome', {
                    candidateName: interview.candidateName,
                    questionCount: formatTakeQuestionCountLabel(interview.totalQuestions, tTake),
                  })}
                </Text>
              </Stack>
              <TakeCapabilityCards />
            </Stack>

            <Stack gap={5} height="full">
              <Stack gap={2}>
                <CardTitle size="lg">{tTake('consentBeforeStart')}</CardTitle>
                <Text variant="bodyMutedSm">{tTake('consentPrepHint')}</Text>
              </Stack>
              <Stack gap={5}>
                <Panel radius="lg" padding="lg">
                  <Stack gap={3}>
                    <Text as="span" variant="eyebrowLabel">
                      {tTake('consentDataCollected')}
                    </Text>
                    <TextList>
                      <TextListItem>
                        <Text variant="bodyMutedSm">{tTake('consentDataCameraMic')}</Text>
                      </TextListItem>
                      <TextListItem>
                        <Text variant="bodyMutedSm">
                          {tTake('consentDataScreen')}
                        </Text>
                      </TextListItem>
                      <TextListItem>
                        <Text variant="bodyMutedSm">{tTake('consentDataBrowser')}</Text>
                      </TextListItem>
                      <TextListItem>
                        <Text variant="bodyMutedSm">{tTake('consentDataMetadata')}</Text>
                      </TextListItem>
                    </TextList>
                  </Stack>
                </Panel>

                {sessionSyncError && onRetrySessionSync ? (
                  <Alert variant="danger">
                    <AlertTitle>{tTake('sessionSyncFailedTitle')}</AlertTitle>
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
                          {tTake('retry')}
                        </Button>
                      </Inline>
                    </AlertDescription>
                  </Alert>
                ) : null}

                {setupError ? (
                  <Alert variant="destructive">
                    <AlertTitle>{tTake('setupIncomplete')}</AlertTitle>
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
                    {tTake('consentContinue')}
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
