import { Camera, Mic, ShieldCheck, Video } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

export function TakeCapabilityCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card className="border-white/60 bg-[hsl(var(--surface-low)/0.9)] shadow-soft">
        <CardContent className="space-y-3 px-5 py-5">
          <Camera className="size-5 text-[hsl(var(--primary))]" />
          <div className="space-y-1">
            <div className="text-sm font-semibold text-foreground">Camera</div>
            <p className="text-sm leading-6 text-muted-foreground">
              Recorded separately for every answer.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/60 bg-[hsl(var(--surface-low)/0.9)] shadow-soft">
        <CardContent className="space-y-3 px-5 py-5">
          <Mic className="size-5 text-[hsl(var(--primary))]" />
          <div className="space-y-1">
            <div className="text-sm font-semibold text-foreground">Microphone</div>
            <p className="text-sm leading-6 text-muted-foreground">
              Captured together with your camera feed.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/60 bg-[hsl(var(--surface-low)/0.9)] shadow-soft">
        <CardContent className="space-y-3 px-5 py-5">
          <Video className="size-5 text-[hsl(var(--primary))]" />
          <div className="space-y-1">
            <div className="text-sm font-semibold text-foreground">Entire screen</div>
            <p className="text-sm leading-6 text-muted-foreground">
              Must be shared as <strong>Entire screen</strong>, not a tab or app window.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/60 bg-[hsl(var(--surface-low)/0.9)] shadow-soft">
        <CardContent className="space-y-3 px-5 py-5">
          <ShieldCheck className="size-5 text-[hsl(var(--primary))]" />
          <div className="space-y-1">
            <div className="text-sm font-semibold text-foreground">Fairness checks</div>
            <p className="text-sm leading-6 text-muted-foreground">
              Session and browser activity may be stored for evaluation integrity.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
