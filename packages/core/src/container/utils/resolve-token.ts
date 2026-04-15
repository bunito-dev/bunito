import { isObject } from '@bunito/common';
import { Id } from '../id';
import type { ProviderOptions, Token } from '../types';

export function resolveToken(tokenLike: Token | ProviderOptions): Id {
  if (isObject(tokenLike)) {
    if ('token' in tokenLike && tokenLike.token !== undefined) {
      return resolveToken(tokenLike.token);
    }

    if ('useClass' in tokenLike) {
      return Id.for(tokenLike.useClass);
    }

    if ('useFactory' in tokenLike) {
      return Id.for(tokenLike.useFactory);
    }

    return Id.for(tokenLike);
  }

  return Id.for(tokenLike);
}
