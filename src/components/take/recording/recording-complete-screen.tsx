import { CheckCircle2 } from 'lucide-react';

import { SurfaceCard } from '@/components/ui/surface-card';
import { PageMain } from '@/components/layout/page-shell';
import { CardContent } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { IconBox } from '@/components/ui/icon-box';
import { Stack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { takeMessage } from '@/features/take';

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
            <IconBox centered>
              <CheckCircle2 size={32} />
            </IconBox>
            <Stack gap={3} align="center">
              <Heading variant="heroTitle">
                {takeMessage('completeTitle').replace('{candidateName}', candidateName)}
              </Heading>
              <Text variant="heroDescription">
                {takeMessage('completeDescription').replace('{position}', position)}
              </Text>
            </Stack>
          </Stack>
        </CardContent>
      </SurfaceCard>
    </PageMain>
  );
}
