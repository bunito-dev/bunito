import { Module } from '@bunito/container';
import { ServerModule } from '@bunito/server';
import { HttpExtension } from './http.extension';

@Module({
  imports: [ServerModule],
  extensions: [HttpExtension],
})
export class HttpModule {}
