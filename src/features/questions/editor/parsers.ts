import type { QuestionExpectedConcept, QuestionRedFlag } from '@/lib/api';

export function parseStringList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinStringList(items: string[]): string {
  return items.join('\n');
}

export function formatExpectedConcepts(items: QuestionExpectedConcept[]): string {
  return items
    .map((item) => [item.id, item.label, item.weight.toFixed(4), item.description].join(' | '))
    .join('\n');
}

export function parseExpectedConcepts(value: string): QuestionExpectedConcept[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [id, label, weight, ...descriptionParts] = line.split('|').map((part) => part.trim());
      const safeLabel = label || id || `concept_${index + 1}`;
      const safeId = id || safeLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      const numericWeight = Number(weight);
      return {
        id: safeId,
        label: safeLabel,
        weight: Number.isFinite(numericWeight) && numericWeight > 0 ? numericWeight : 1,
        description: descriptionParts.join(' | ') || `${safeLabel} should be covered in the answer.`,
      };
    });
}

export function formatRedFlags(items: QuestionRedFlag[]): string {
  return items.map((item) => [item.id, item.label, item.severity].join(' | ')).join('\n');
}

export function parseRedFlags(value: string): QuestionRedFlag[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [id, label, severity] = line.split('|').map((part) => part.trim());
      const safeLabel = label || id || `red_flag_${index + 1}`;
      const safeId = id || safeLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      return {
        id: safeId,
        label: safeLabel,
        severity: severity === 'low' || severity === 'medium' || severity === 'high' ? severity : 'medium',
      };
    });
}

export function formatMetadata(value: Record<string, unknown>): string {
  return JSON.stringify(value, null, 2);
}

export function parseMetadata(value: string): Record<string, unknown> {
  if (!value.trim()) {
    return {};
  }

  const parsed = JSON.parse(value) as unknown;
  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new Error('Metadata must be a JSON object');
  }

  return parsed as Record<string, unknown>;
}
