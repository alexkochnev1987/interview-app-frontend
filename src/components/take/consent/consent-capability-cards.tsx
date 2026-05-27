import { Camera, Mic, ShieldCheck, Video } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Grid, Stack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Panel } from '@/components/ui/panel';
import { takeMessage } from '@/features/take';

interface CapabilityCardProps {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
}

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
  const capabilityItems: CapabilityCardProps[] = [
    { icon: Camera, title: takeMessage('capabilityCameraTitle'), description: takeMessage('capabilityCameraDescription') },
    { icon: Mic, title: takeMessage('capabilityMicTitle'), description: takeMessage('capabilityMicDescription') },
    {
      icon: Video,
      title: takeMessage('capabilityScreenTitle'),
      description: takeMessage('capabilityScreenDescription'),
    },
    {
      icon: ShieldCheck,
      title: takeMessage('capabilityFairnessTitle'),
      description: takeMessage('capabilityFairnessDescription'),
    },
  ];

  return (
    <Grid columns={2} gap={6}>
      {capabilityItems.map((item) => (
        <CapabilityCard key={item.title} icon={item.icon} title={item.title} description={item.description} />
      ))}
    </Grid>
  );
}
