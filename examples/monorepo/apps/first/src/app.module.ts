import { LoggerModule, Module } from '@bunito/bunito';
import { ExampleModule } from '@libs/example';
import { FirstService } from './first.service';

@Module({
  imports: [LoggerModule, ExampleModule],
  providers: [FirstService],
})
export class AppModule {}
