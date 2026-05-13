import { LoggerModule, Module } from '@bunito/bunito';
import { HTTPModule } from '@bunito/http';
import { FooController } from './foo-controller';

@Module({
  imports: [LoggerModule, HTTPModule],
  controllers: [FooController],
})
export class AppModule {}
