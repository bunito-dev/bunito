import { extractWords } from './extract-words';

export function toKebabCase(input: string): string {
  const words = extractWords(input);

  let result = words.join('-');

  if (!result) {
    return 'item';
  }

  if (!/^[a-z]/.test(result)) {
    result = `x-${result}`;
  }
  return result;
}
