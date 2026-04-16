import { Module } from '@bunito/bunito';
import { BarController } from './bar.controller';
import { BarService } from './bar.service';

// This nested feature module is imported by FooModule and inherits its `/foo` prefix.
@Module({
  uses: [BarController, BarService],
})
export class BarModule {}
