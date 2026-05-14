import { LoggerModule, Module } from '@bunito/bunito';
import { HTTPModule, JSONSerializer, UseCORS, UseMiddleware } from '@bunito/http';
import { AppController } from './app-controller';
import { FooModule } from './foo';

@Module({
  imports: [LoggerModule, HTTPModule, FooModule],
  controllers: [AppController],
})
@UseMiddleware(JSONSerializer)
@UseCORS({
  origin: '*',
  credentials: true,
})
export class AppModule {}
