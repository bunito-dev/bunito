import type { RawObject } from '@bunito/common';
import { isString } from '@bunito/common';
import type { Template } from '../types';

export function renderTemplate<TTemplate extends Template>(
  template: TTemplate,
  ...args: Parameters<TTemplate>
): RawObject<string> {
  const result = template(...args);

  return Object.fromEntries(
    Object.entries(result).map(([key, value]) => {
      if (isString(value)) {
        let lines = value
          .split('\n')
          .slice(1, -1)
          .map((line) => line);

        const margin = lines[0] ? lines[0].length - lines[0].trimStart().length : 0;

        lines = lines.map((line) => line.slice(margin));
        lines.push('');
        return [key, lines.join('\n')];
      }

      return [key, `${JSON.stringify(value, null, 2)}\n`];
    }),
  );
}
