export function extractWords(input: string): string[] {
  return input
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .toLowerCase()
    .split(' ')
    .filter(Boolean);
}
