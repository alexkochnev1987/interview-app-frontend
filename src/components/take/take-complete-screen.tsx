import { SurfaceCard } from '@/components/ui/surface-card';
import { PageMain } from '@/components/layout/page-shell';
import { CardContent } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Stack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { TakeSubmissionIconBox } from './take-submission-icon-box';

interface TakeCompleteScreenProps {
  candidateName: string;
  position: string;
}

export function TakeCompleteScreen({ candidateName, position }: TakeCompleteScreenProps) {
  return (
    <PageMain>
      <SurfaceCard tone="glassFloat" size="lg">
        <CardContent layout="stack-center" spacing="xl">
          <Stack gap={6} align="center" width="full">
            <TakeSubmissionIconBox />
            <Stack gap={3} align="center">
              <Heading variant="heroTitle">Thank you, {candidateName}</Heading>
              <Text variant="heroDescription">
                Your interview for <strong>{position}</strong> has been submitted.
              </Text>
              <Text variant="bodyMutedSm">
                Camera and full-screen recordings for each answer have been stored for reviewer
                evaluation.
              </Text>
            </Stack>
          </Stack>
        </CardContent>
      </SurfaceCard>
    </PageMain>
  );
}
