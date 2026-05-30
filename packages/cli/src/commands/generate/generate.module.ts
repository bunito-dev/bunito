import { Module } from '@bunito/container';
import { IOModule, ProjectModule } from '../../core';
import { GenerateCommand } from './generate.command';

@Module({
  imports: [IOModule, ProjectModule],
  extensions: [GenerateCommand],
})
export class GenerateModule {}
