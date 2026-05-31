import { Module } from '@bunito/bunito';
import { BarService } from './bar.service';

@Module({
  providers: [BarService],
  exports: [BarService],
})
export class BarModule {}
