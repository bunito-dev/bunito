import { ConfigExtension } from '@bunito/config/internals';
import { secrets } from 'bun';
import type { SecretKey } from './types';
import { parseSecretKey } from './utils';

@ConfigExtension()
export class BunSecretsExtension implements ConfigExtension {
  async getSecret(key: SecretKey): Promise<unknown> {
    const options = parseSecretKey(key, false);

    if (!options) {
      return;
    }

    return secrets.get(options);
  }

  async setSecret(
    key: SecretKey,
    value: string,
    options: {
      allowUnrestrictedAccess?: boolean;
    } = {},
  ): Promise<void> {
    return secrets.set({
      ...parseSecretKey(key),
      ...options,
      value,
    });
  }

  async deleteSecret(key: SecretKey): Promise<boolean> {
    return secrets.delete(parseSecretKey(key));
  }
}
