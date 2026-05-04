import { Module } from '@bunito/container';
import { SecretsService } from './secrets.service';
import { SecretsConfigReader } from './secrets-config-reader';

@Module({
  providers: [SecretsService],
  extensions: [SecretsConfigReader],
  exports: [SecretsService, SecretsConfigReader],
})
export class SecretsModule {}
