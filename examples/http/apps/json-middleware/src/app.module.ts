import { LoggerModule, Module } from '@bunito/bunito';
import { HTTPModule, JSONModule } from '@bunito/http';
import { FooController } from './foo.controller';

@Module({
  imports: [LoggerModule, HTTPModule, JSONModule],
  controllers: [FooController],
})
export class AppModule {}
