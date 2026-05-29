import { Module } from '@bunito/container';
import { RunnerService } from './runner.service';

@Module({
  providers: [RunnerService],
  exports: [RunnerService],
})
export class RunnerModule {}
