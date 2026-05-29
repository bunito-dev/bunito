import { ConfigReader } from '@bunito/config';
import { BunSecretsService } from './bun-secrets.service';
import type { SecretKey } from './types';

@ConfigReader({
  injects: [BunSecretsService],
})
export class BunSecretsConfigReader implements ConfigReader {
  readonly NAME = 'bun-secrets';

  constructor(private readonly secretsService: BunSecretsService) {}

  getSecret(key: string): Promise<unknown> {
    return this.secretsService.getSecret(key as SecretKey);
  }
}
