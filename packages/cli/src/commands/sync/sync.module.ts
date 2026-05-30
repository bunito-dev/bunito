import { Module } from '@bunito/container';
import { IOModule, ProjectModule } from '../../core';
import { SyncCommand } from './sync.command';

@Module({
  imports: [IOModule, ProjectModule],
  extensions: [SyncCommand],
})
export class SyncModule {}
