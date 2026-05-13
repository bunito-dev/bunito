import { Module, UsePrefix } from '@bunito/bunito';
import { JSONSerializer, UseMiddleware } from '@bunito/http';
import { BarController } from './bar-controller';

@Module({
  controllers: [BarController],
})
// Module-level middleware keeps JSON behavior local to the /bar API.
@UsePrefix('/bar')
@UseMiddleware(JSONSerializer)
export class BarModule {}
