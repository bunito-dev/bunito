import { BarModule } from '@apps/bar';
import { FooModule } from '@apps/foo';
import { Module } from '@bunito/bunito';

@Module({
  imports: [FooModule, BarModule],
})
export class AppModule {}
