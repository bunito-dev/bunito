import { Module } from '@bunito/bunito';
import { BarModule } from '../bar';
import { FooService } from './foo.service';

@Module({
  imports: [BarModule],
  providers: [FooService],
  exports: [FooService],
})
export class FooModule {}
