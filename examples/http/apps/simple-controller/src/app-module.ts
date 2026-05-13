import { LoggerModule, Module } from '@bunito/bunito';
import { HTTPModule } from '@bunito/http';
import { FooController } from './foo-controller';
import { FooService } from './foo-service';

@Module({
  imports: [LoggerModule, HTTPModule],
  providers: [FooService],
  controllers: [FooController],
})
export class AppModule {}
