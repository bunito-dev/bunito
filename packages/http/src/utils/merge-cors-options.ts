import type { CORSOptions } from '../types';

export function mergeCorsOptions(
  currentOptions: CORSOptions | undefined,
  mergedOptions: CORSOptions | undefined,
): CORSOptions | undefined {
  if (!currentOptions && !mergedOptions) {
    return undefined;
  }

  if (!mergedOptions || !currentOptions) {
    return mergedOptions ?? currentOptions;
  }

  return {
    ...currentOptions,
    ...mergedOptions,
  };
}
