import { Module, UsePrefix } from '@bunito/bunito';
import { UseCORS } from '@bunito/http';
import { BarController } from './bar.controller';

@Module({
  controllers: [BarController],
})
@UsePrefix('bar')
@UseCORS({
  credentials: true,
})
export class BarModule {}
