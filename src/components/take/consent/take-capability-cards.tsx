import { Camera, Mic, ShieldCheck, Video } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { SurfaceCard } from '@/components/app/surface-card';
import { CardContent } from '@/components/ui/card';
import { Grid, Stack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';

interface CapabilityCardProps {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
}

function CapabilityCard({ icon: Icon, title, description }: CapabilityCardProps) {
  return (
    <SurfaceCard tone="mutedSoft">
      <CardContent layout="compact">
        <Text as="span" variant="iconPrimary">
          <Icon size={20} />
        </Text>
        <Stack gap={1}>
          <Text as="span" variant="labelSmStrong">
            {title}
          </Text>
          <Text variant="bodyMutedSm">{description}</Text>
        </Stack>
      </CardContent>
    </SurfaceCard>
  );
}

export function TakeCapabilityCards() {
  const items: CapabilityCardProps[] = [
    { icon: Camera, title: 'Camera', description: 'Recorded separately for every answer.' },
    { icon: Mic, title: 'Microphone', description: 'Captured together with your camera feed.' },
    {
      icon: Video,
      title: 'Entire screen',
      description: (
        <>
          Must be shared as <strong>Entire screen</strong>, not a tab or app window.
        </>
      ),
    },
    { icon: ShieldCheck, title: 'Fairness checks', description: 'Session and browser activity may be stored for evaluation integrity.' },
  ];

  return (
    <Grid columns="2-md-4-xl" gap={4}>
      {items.map((item) => (
        <CapabilityCard key={item.title} icon={item.icon} title={item.title} description={item.description} />
      ))}
    </Grid>
  );
}
