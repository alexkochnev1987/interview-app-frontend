export function formatAnswerDuration(seconds?: number) {
  if (!seconds || seconds < 1) {
    return 'n/a';
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

export function formatFileSize(bytes?: number) {
  if (!bytes || bytes < 1) {
    return 'n/a';
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatWorkflowStage(stage?: string) {
  if (!stage) {
    return 'idle';
  }

  return stage.replaceAll('_', ' ');
}
