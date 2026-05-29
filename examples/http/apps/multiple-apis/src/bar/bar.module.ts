import { Module, UsePrefix } from '@bunito/bunito';
import { BarController } from './bar.controller';

@Module({
  controllers: [BarController],
})
// Module-level middleware keeps JSON behavior local to the /bar API.
@UsePrefix('/bar')
export class BarModule {}
