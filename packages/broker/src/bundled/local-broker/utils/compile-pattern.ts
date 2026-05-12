import { InternalException } from '@bunito/common';

export function compilePattern(pattern: string): RegExp {
  const tokens = pattern.split('.');
  const parts = tokens.map((token, index) => {
    if (token === '*') {
      return '[^.]+';
    }

    if (token === '>') {
      if (index !== tokens.length - 1) {
        throw new InternalException(
          'Wildcard can only be used as the last token in a pattern.',
        );
      }

      return '.+';
    }

    return token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  });

  return new RegExp(`^${parts.join('\\.')}$`);
}
