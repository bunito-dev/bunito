import type { Class, Fn } from '@bunito/common';
import { isObject } from '@bunito/common';
import { Id } from '../id';
import type { ProviderLike, Token } from '../types';

export function resolveProviderId(providerLike: ProviderLike): Id {
  let token: Token | undefined;

  if (isObject(providerLike)) {
    if ('token' in providerLike) {
      token = providerLike.token as Token;
    } else if ('useClass' in providerLike) {
      token = providerLike.useClass as Class;
    } else if ('useFactory' in providerLike) {
      token = providerLike.useFactory as Fn;
    }
  }

  return Id.for(token ?? providerLike);
}
