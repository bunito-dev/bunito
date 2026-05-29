import { Module } from '@bunito/container';
import { IOService } from './io.service';

@Module({
  providers: [IOService],
  exports: [IOService],
})
export class IOModule {}
