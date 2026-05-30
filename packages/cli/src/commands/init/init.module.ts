import { Module } from '@bunito/container';
import { IOModule, ProjectModule } from '../../core';
import { InitCommand } from './init.command';

@Module({
  imports: [IOModule, ProjectModule],
  extensions: [InitCommand],
})
export class InitModule {}
