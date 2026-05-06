import { RESERVED_NAMES } from '../constants';
import { extractWords } from './extract-words';

export function toPascalCase(input: string): string {
  const words = extractWords(input);

  let result = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');

  if (!/^[A-Za-z]/.test(result)) {
    result = `X${result}`;
  }

  if (RESERVED_NAMES.has(result.toLowerCase())) {
    result += 'Class';
  }

  return result || 'X';
}
