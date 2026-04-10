import { Module } from '@bunito/core';
import { BarController } from './bar.controller';
import { BarService } from './bar.service';

@Module({
  controllers: [BarController],
  providers: [BarService],
})
export class BarModule {}
