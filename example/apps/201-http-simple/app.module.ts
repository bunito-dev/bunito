import { LoggerModule, Module } from '@bunito/bunito';
import { HttpModule } from '@bunito/http';
import { FooModule } from './foo';

// The root module wires together infrastructure modules and the feature module.
@Module({
  imports: [LoggerModule, FooModule, HttpModule],
})
export class AppModule {}
