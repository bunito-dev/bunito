import { BarModule } from '@apps/bar';
import { FooModule } from '@apps/foo';
import { Module } from '@bunito/bunito';
import { AppController } from './app-controller';

@Module({
  imports: [FooModule, BarModule],
  controllers: [AppController],
})
export class AppModule {}
