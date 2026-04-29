import { Camera, Mic, ShieldCheck, Video } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { SurfaceCard } from '@/components/app/surface-card';
import { BodyMutedSm, CardContentCompact, LabelSmStrong } from '@/components/layout/content-presets';

interface CapabilityCardProps {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
}

const iconClassName = 'size-5 text-[hsl(var(--primary))]';

function CapabilityCard({ icon: Icon, title, description }: CapabilityCardProps) {
  return (
    <SurfaceCard tone="mutedSoft">
      <CardContentCompact>
        <Icon className={iconClassName} />
        <div className="space-y-1">
          <LabelSmStrong>{title}</LabelSmStrong>
          <BodyMutedSm>{description}</BodyMutedSm>
        </div>
      </CardContentCompact>
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
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <CapabilityCard key={item.title} icon={item.icon} title={item.title} description={item.description} />
      ))}
    </div>
  );
}
