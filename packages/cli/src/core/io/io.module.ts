import { Module } from '@bunito/container';
import { ProcessModule } from '../process';
import { IOService } from './io.service';

@Module({
  imports: [ProcessModule],
  providers: [IOService],
  exports: [IOService],
})
export class IOModule {}
