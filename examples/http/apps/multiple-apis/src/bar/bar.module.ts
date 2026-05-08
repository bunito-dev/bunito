import { Module } from '@bunito/bunito';
import { JSONMiddleware, JSONModule, UseMiddleware, UsePrefix } from '@bunito/http';
import { BarController } from './bar.controller';

@Module({
  imports: [JSONModule],
  controllers: [BarController],
})
// Module-level middleware keeps JSON behavior local to the /bar API.
@UsePrefix('/bar')
@UseMiddleware(JSONMiddleware)
export class BarModule {}
