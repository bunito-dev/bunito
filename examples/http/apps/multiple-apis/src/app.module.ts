import { Module } from '@bunito/bunito';
import { BarModule } from './bar';
import { FooModule } from './foo';

@Module({
  imports: [FooModule, BarModule],
})
export class AppModule {}
