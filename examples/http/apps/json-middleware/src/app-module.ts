import { LoggerModule, Module } from '@bunito/bunito';
import { HTTPModule } from '@bunito/http';
import { AppController } from './app-controller';
import { FooController } from './foo-controller';

@Module({
  imports: [LoggerModule, HTTPModule],
  controllers: [AppController, FooController],
})
export class AppModule {}
