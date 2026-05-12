import { LoggerModule, Module } from '@bunito/bunito';
import { ExampleModule } from '@libs/example';
import { SecondService } from './second-service';

@Module({
  imports: [LoggerModule, ExampleModule],
  providers: [SecondService],
})
export class SecondModule {}
