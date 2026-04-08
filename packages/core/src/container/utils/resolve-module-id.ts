import { isObject } from '@bunito/common';
import { Id } from '../id';
import type { ModuleLike, Token } from '../types';

export function resolveModuleId(moduleLike: ModuleLike): Id {
  let token: Token | undefined;

  if (isObject(moduleLike) && 'token' in moduleLike) {
    token = moduleLike.token as Token;
  }

  return Id.for(token ?? moduleLike);
}
