import { LoggerModule, Module } from '@bunito/bunito';
import { HttpModule } from '@bunito/http';
import { AppController } from './app.controller';
import { FooModule } from './foo';

@Module({
  imports: [LoggerModule, FooModule, HttpModule],
  uses: [AppController],
})
export class AppModule {}
