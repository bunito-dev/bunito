export function formatDuration(duration: number): string {
  if (duration === 0) {
    return '~1ms';
  } else if (duration < 1000) {
    return `+${duration}ms`;
  } else {
    return `+${(duration / 1000).toFixed(3)}s`;
  }
}
