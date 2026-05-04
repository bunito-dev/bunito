import { ServerModule } from '@bunito/bun';
import { Module } from '@bunito/container';
import { HTTPRouter } from './http-router';
import { HTTPRouterConfig } from './http-router.config';

@Module({
  imports: [ServerModule],
  configs: [HTTPRouterConfig],
  extensions: [HTTPRouter],
})
export class HTTPModule {}
