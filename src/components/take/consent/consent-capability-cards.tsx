import { Camera, Mic, ShieldCheck, Video } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { Grid, Stack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Panel } from '@/components/ui/panel';

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
  const tTake = useTranslations('takeFlow');
  const capabilityItems: CapabilityCardProps[] = [
    { icon: Camera, title: tTake('capabilityCameraTitle'), description: tTake('capabilityCameraDescription') },
    { icon: Mic, title: tTake('capabilityMicTitle'), description: tTake('capabilityMicDescription') },
    {
      icon: Video,
      title: tTake('capabilityScreenTitle'),
      description: tTake('capabilityScreenDescription'),
    },
    {
      icon: ShieldCheck,
      title: tTake('capabilityFairnessTitle'),
      description: tTake('capabilityFairnessDescription'),
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
