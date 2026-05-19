import { Module } from '@bunito/bunito';
import { ExampleService } from './example-service';

@Module({
  providers: [ExampleService],
  exports: [ExampleService],
})
export class ExampleModule {}
