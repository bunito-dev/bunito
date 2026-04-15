import { isObject } from '@bunito/common';
import type { InjectionDefinition, InjectionOptionsLike } from '../types';
import { resolveToken } from './resolve-token';

export function resolveInjections(
  injections: InjectionOptionsLike[] | undefined,
): InjectionDefinition[] {
  return injections
    ? injections.map((optionsLike) => {
        let defaultValue: unknown;

        if (isObject(optionsLike)) {
          if ('optional' in optionsLike) {
            defaultValue = null;
          } else if ('defaultValue' in optionsLike) {
            defaultValue = optionsLike.defaultValue ?? null;
          }
        }

        return {
          providerId: resolveToken(optionsLike),
          defaultValue,
        };
      })
    : [];
}
