import { Module } from '@bunito/container';
import { IOModule, ProjectModule } from '../../core';
import { BuildCommand } from './build.command';

@Module({
  imports: [IOModule, ProjectModule],
  extensions: [BuildCommand],
})
export class BuildModule {}
