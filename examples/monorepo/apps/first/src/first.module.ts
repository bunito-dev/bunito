import { Module } from '@bunito/bunito';
import { ExampleModule } from '@libs/example';
import { FirstService } from './first.service';

@Module({
  imports: [ExampleModule],
  providers: [FirstService],
})
export class FirstModule {}
