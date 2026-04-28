import { CheckCircle2 } from 'lucide-react';

import { SurfaceCard } from '@/components/app/surface-card';
import { CardContent } from '@/components/ui/card';

interface TakeCompleteScreenProps {
  candidateName: string;
  position: string;
}

export function TakeCompleteScreen({ candidateName, position }: TakeCompleteScreenProps) {
  return (
    <main className="container py-12">
      <SurfaceCard tone="glassFloat" className="mx-auto max-w-4xl">
        <CardContent className="space-y-6 px-8 py-10 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-[1.4rem] bg-[hsl(var(--primary-fixed)/0.85)] text-[hsl(var(--primary))]">
            <CheckCircle2 className="size-8" />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl">
              Thank you, {candidateName}
            </h1>
            <p className="text-base leading-7 text-muted-foreground md:text-lg">
              Your interview for <strong>{position}</strong> has been submitted.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              Camera and full-screen recordings for each answer have been stored for reviewer
              evaluation.
            </p>
          </div>
        </CardContent>
      </SurfaceCard>
    </main>
  );
}
