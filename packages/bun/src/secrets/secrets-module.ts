import { Module } from '@bunito/container';
import { SecretsConfigReader } from './secrets-config-reader';
import { SecretsService } from './secrets-service';

@Module({
  providers: [SecretsService],
  extensions: [SecretsConfigReader],
  exports: [SecretsService],
})
export class SecretsModule {}
