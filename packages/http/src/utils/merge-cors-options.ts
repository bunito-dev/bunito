import type { CORSOptions } from '../types';

export function mergeCorsOptions(
  current: CORSOptions | undefined,
  options: CORSOptions | undefined,
): CORSOptions | undefined {
  if (!current && !options) {
    return undefined;
  }

  if (!options || !current) {
    return options ?? current;
  }

  return {
    ...current,
    ...options,
  };
}
