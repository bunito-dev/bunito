import { ServerModule } from '@bunito/bun';
import { Module } from '@bunito/container';
import { HttpRouter } from './http.router';

@Module({
  imports: [ServerModule],
  extensions: [HttpRouter],
})
export class HttpModule {}
