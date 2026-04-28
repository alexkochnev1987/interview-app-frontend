import { Camera, Mic, ShieldCheck, Video } from 'lucide-react';

import { SurfaceCard } from '@/components/app/surface-card';
import { CardContentCompact } from '@/components/layout/content-presets';

export function TakeCapabilityCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <SurfaceCard tone="mutedSoft">
        <CardContentCompact>
          <Camera className="size-5 text-[hsl(var(--primary))]" />
          <div className="space-y-1">
            <div className="text-sm font-semibold text-foreground">Camera</div>
            <p className="text-sm leading-6 text-muted-foreground">
              Recorded separately for every answer.
            </p>
          </div>
        </CardContentCompact>
      </SurfaceCard>

      <SurfaceCard tone="mutedSoft">
        <CardContentCompact>
          <Mic className="size-5 text-[hsl(var(--primary))]" />
          <div className="space-y-1">
            <div className="text-sm font-semibold text-foreground">Microphone</div>
            <p className="text-sm leading-6 text-muted-foreground">
              Captured together with your camera feed.
            </p>
          </div>
        </CardContentCompact>
      </SurfaceCard>

      <SurfaceCard tone="mutedSoft">
        <CardContentCompact>
          <Video className="size-5 text-[hsl(var(--primary))]" />
          <div className="space-y-1">
            <div className="text-sm font-semibold text-foreground">Entire screen</div>
            <p className="text-sm leading-6 text-muted-foreground">
              Must be shared as <strong>Entire screen</strong>, not a tab or app window.
            </p>
          </div>
        </CardContentCompact>
      </SurfaceCard>

      <SurfaceCard tone="mutedSoft">
        <CardContentCompact>
          <ShieldCheck className="size-5 text-[hsl(var(--primary))]" />
          <div className="space-y-1">
            <div className="text-sm font-semibold text-foreground">Fairness checks</div>
            <p className="text-sm leading-6 text-muted-foreground">
              Session and browser activity may be stored for evaluation integrity.
            </p>
          </div>
        </CardContentCompact>
      </SurfaceCard>
    </div>
  );
}
