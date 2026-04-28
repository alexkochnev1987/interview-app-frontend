import type { ReactNode } from 'react';

import { SurfaceCard } from '@/components/app/surface-card';
import { CardContentCompact } from '@/components/layout/content-presets';

interface LoginFeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function LoginFeatureCard({ icon, title, description }: LoginFeatureCardProps) {
  return (
    <SurfaceCard tone="glassSoft">
      <CardContentCompact>
        <div className="flex size-10 items-center justify-center rounded-2xl bg-[hsl(var(--primary-fixed)/0.85)] text-[hsl(var(--primary))]">
          {icon}
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </CardContentCompact>
    </SurfaceCard>
  );
}
