import { Module } from '@bunito/container';
import { ProjectModule, SystemModule } from '../core';
import { BuildCommand } from './build';
import { CommandService } from './command.service';
import { GenerateCommand } from './generate';
import { InitCommand } from './init';
import { StartCommand } from './start';

@Module({
  imports: [SystemModule, ProjectModule],
  providers: [CommandService],
  extensions: [
    InitCommand, //
    StartCommand,
    BuildCommand,
    GenerateCommand,
  ],
})
export class CommandModule {}
