import type { ReactNode } from 'react';

import { SurfaceCard } from '@/components/app/surface-card';
import { CardContent } from '@/components/ui/card';

interface LoginFeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function LoginFeatureCard({ icon, title, description }: LoginFeatureCardProps) {
  return (
    <SurfaceCard tone="glassSoft">
      <CardContent className="space-y-3 px-5 py-5">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-[hsl(var(--primary-fixed)/0.85)] text-[hsl(var(--primary))]">
          {icon}
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </SurfaceCard>
  );
}
