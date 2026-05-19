import { Camera, Mic, ShieldCheck, Video } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Grid, Stack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Panel } from '@/components/ui/panel';

interface CapabilityCardProps {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
}

const CAPABILITY_ITEMS: CapabilityCardProps[] = [
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
  {
    icon: ShieldCheck,
    title: 'Fairness checks',
    description: 'Session and browser activity may be stored for evaluation integrity.',
  },
];

function CapabilityCard({ icon: Icon, title, description }: CapabilityCardProps) {
  return (
    <Panel radius="lg" padding="md">
      <Stack gap={2}>
        <Text as="span" variant="iconPrimary">
          <Icon size={20} strokeWidth={2} />
        </Text>
        <Stack gap={1}>
          <Text as="span" variant="labelSmStrong">
            {title}
          </Text>
          <Text variant="bodyMutedSm">{description}</Text>
        </Stack>
      </Stack>
    </Panel>
  );
}

export function TakeCapabilityCards() {
  return (
    <Grid columns={2} gap={6}>
      {CAPABILITY_ITEMS.map((item) => (
        <CapabilityCard key={item.title} icon={item.icon} title={item.title} description={item.description} />
      ))}
    </Grid>
  );
}
