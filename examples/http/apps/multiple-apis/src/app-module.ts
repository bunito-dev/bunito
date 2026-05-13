import { LoggerModule, Module } from '@bunito/bunito';
import { HTTPModule } from '@bunito/http';
import { BarModule } from './bar';
import { FooModule } from './foo';

@Module({
  imports: [LoggerModule, HTTPModule, FooModule, BarModule],
})
export class AppModule {}
