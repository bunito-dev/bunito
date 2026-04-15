import { Module } from '@bunito/core';
import { BarController } from './bar.controller';
import { BarService } from './bar.service';

// This nested feature module is imported by FooModule and inherits its `/foo` prefix.
@Module({
  controllers: [BarController],
  providers: [BarService],
})
export class BarModule {}
