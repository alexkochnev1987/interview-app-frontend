export function resultTone(result?: string) {
  switch (result?.toLowerCase()) {
    case 'pass':
    case 'passed':
    case 'strong_hire':
    case 'hire':
      return 'completed' as const;
    case 'borderline':
      return 'processing' as const;
    case 'fail':
    case 'failed':
    case 'no_hire':
      return 'failed' as const;
    default:
      return 'neutral' as const;
  }
}
