import { Module } from '@bunito/container';
import { BunSecretsExtension } from './bun-secrets.extension';

@Module({
  extensions: [BunSecretsExtension],
  exports: [BunSecretsExtension],
})
export class BunSecretsModule {}
