import { Module } from '@bunito/container';
import { ServerModule } from '@bunito/server/internals';
import { HttpExtension } from './http.extension';

@Module({
  imports: [ServerModule],
  extensions: [HttpExtension],
})
export class HttpModule {}
