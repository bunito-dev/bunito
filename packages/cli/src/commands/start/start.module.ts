import { Module } from '@bunito/container';
import { ProjectModule, RunnerModule } from '../../core';
import { StartCommand } from './start.command';

@Module({
  imports: [ProjectModule, RunnerModule],
  extensions: [StartCommand],
})
export class StartModule {}
