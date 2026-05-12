import { InternalException } from '@bunito/common';
import type { SecretKey, SecretOptions } from '../types';

export function parseSecretKey(
  key: SecretKey,
  throwOnUndefined: false,
): SecretOptions | undefined;
export function parseSecretKey(key: SecretKey): SecretOptions;
export function parseSecretKey(
  key: SecretKey,
  throwOnUndefined = true,
): SecretOptions | undefined {
  const [service, name] = key.split('.');

  if (!service || !name) {
    if (throwOnUndefined) {
      return InternalException.throw`Invalid Bun secret key: ${key}. Expected format: <service>.<name>`;
    }

    return;
  }

  return {
    service,
    name,
  };
}
