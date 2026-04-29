import { SurfaceCard } from '@/components/app/surface-card';
import { MaxWidth4xl, PageMainCompact } from '@/components/layout/page-shell';
import { CardContent } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
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
          <CardContent>
            <div className="space-y-6 px-8 py-10 text-center">
              <TakeSubmissionIconBox />
              <div className="space-y-3">
                <Heading variant="heroTitle">Thank you, {candidateName}</Heading>
                <Text variant="heroDescription">
                  Your interview for <strong>{position}</strong> has been submitted.
                </Text>
                <Text variant="bodyMutedSm">
                  Camera and full-screen recordings for each answer have been stored for reviewer
                  evaluation.
                </Text>
              </div>
            </div>
          </CardContent>
        </SurfaceCard>
      </MaxWidth4xl>
    </PageMainCompact>
  );
}
