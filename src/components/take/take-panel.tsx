import type { ComponentProps } from 'react';
import { Panel } from '@/components/ui/panel';

type TakePanelProps = ComponentProps<typeof Panel>;

export function TakePanel({ tone, radius, padding, minHeight, ...props }: TakePanelProps) {
  return <Panel tone={tone} radius={radius} padding={padding} minHeight={minHeight} {...props} />;
}
