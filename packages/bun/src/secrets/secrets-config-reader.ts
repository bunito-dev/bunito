import { ConfigReader } from '@bunito/config/internals';
import { SecretsService } from './secrets.service';
import type { SecretKey } from './types';

@ConfigReader({
  injects: [SecretsService],
})
export class SecretsConfigReader implements ConfigReader {
  constructor(private readonly secretsService: SecretsService) {}

  getSecret(key: string): Promise<unknown> {
    return this.secretsService.getSecret(key as SecretKey);
  }
}
