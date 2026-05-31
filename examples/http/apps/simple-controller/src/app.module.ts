import { Module } from '@bunito/bunito';
import { FooModule } from './foo';

@Module({
  imports: [FooModule],
})
export class AppModule {}
