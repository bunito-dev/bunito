import { Module } from '@bunito/bunito';
import { HTTPModule } from '@bunito/http';
import { AppController } from './app-controller';
import { BarModule } from './bar';
import { FooModule } from './foo';

@Module({
  imports: [HTTPModule, FooModule, BarModule],
  controllers: [AppController],
})
export class AppModule {}
