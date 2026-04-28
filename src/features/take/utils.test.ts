import { describe, expect, it } from 'vitest';

import { formatTime, permissionClasses, permissionLabel } from './utils';

describe('take utils', () => {
  it('returns expected permission labels', () => {
    expect(permissionLabel('idle')).toBe('Idle');
    expect(permissionLabel('pending')).toBe('Pending');
    expect(permissionLabel('granted')).toBe('Ready');
    expect(permissionLabel('denied')).toBe('Blocked');
  });

  it('maps permission status to semantic token classes', () => {
    expect(permissionClasses('pending')).toContain('--color-status-pending-bg');
    expect(permissionClasses('granted')).toContain('--color-status-completed-bg');
    expect(permissionClasses('denied')).toContain('text-destructive');
    expect(permissionClasses('idle')).toContain('text-muted-foreground');
  });

  it('formats timer values consistently', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(601)).toBe('10:01');
  });
});
