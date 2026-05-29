import { Module } from '@bunito/container';
import { BunSecretsConfigReader } from './bun-secrets.config-reader';
import { BunSecretsService } from './bun-secrets.service';

@Module({
  providers: [BunSecretsService],
  extensions: [BunSecretsConfigReader],
  exports: [BunSecretsService],
})
export class BunSecretsModule {}
