import { SurfaceCard } from '@/components/app/surface-card';
import { BodyMutedSm, HeroDescription, HeroTitle } from '@/components/layout/content-presets';
import { MaxWidth4xl, PageMainCompact } from '@/components/layout/page-shell';
import { CardContent } from '@/components/ui/card';

import { TakeSubmissionIconBox } from './take-submission-icon-box';

interface TakeCompleteScreenProps {
  candidateName: string;
  position: string;
}

export function TakeCompleteScreen({ candidateName, position }: TakeCompleteScreenProps) {
  return (
    <PageMainCompact>
      <MaxWidth4xl>
        <SurfaceCard tone="glassFloat">
          <CardContent className="space-y-6 px-8 py-10 text-center">
            <TakeSubmissionIconBox />
            <div className="space-y-3">
              <HeroTitle>Thank you, {candidateName}</HeroTitle>
              <HeroDescription>
                Your interview for <strong>{position}</strong> has been submitted.
              </HeroDescription>
              <BodyMutedSm>
                Camera and full-screen recordings for each answer have been stored for reviewer
                evaluation.
              </BodyMutedSm>
            </div>
          </CardContent>
        </SurfaceCard>
      </MaxWidth4xl>
    </PageMainCompact>
  );
}
