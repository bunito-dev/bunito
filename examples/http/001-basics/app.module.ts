import { LoggerModule, Module, ServerModule } from '@bunito/core';
import { HttpModule } from '@bunito/http';
import { FooModule } from './foo';

@Module({
  imports: [LoggerModule, ServerModule, HttpModule, FooModule],
})
export class AppModule {}
