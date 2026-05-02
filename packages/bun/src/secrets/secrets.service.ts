import { Provider } from '@bunito/container';
import type { SecretKey, SetSecretOptions } from './types';
import { parseSecretKey } from './utils';

@Provider()
export class SecretsService {
  getSecret(key: SecretKey): Promise<string | null> {
    const { service, name } = parseSecretKey(key);

    return Bun.secrets.get({
      service,
      name,
    });
  }

  setSecret(
    key: SecretKey,
    value: string,
    options: SetSecretOptions = {},
  ): Promise<void> {
    const { service, name } = parseSecretKey(key);

    return Bun.secrets.set({
      service,
      name,
      value,
      ...options,
    });
  }

  deleteSecret(key: SecretKey): Promise<boolean> {
    const { service, name } = parseSecretKey(key);

    return Bun.secrets.delete({
      service,
      name,
    });
  }
}
