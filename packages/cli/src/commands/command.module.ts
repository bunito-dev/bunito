import { Module } from '@bunito/container';
import { IOModule } from '../core';
import { BuildModule } from './build';
import { CommandService } from './command.service';
import { GenerateModule } from './generate';
import { InitModule } from './init';
import { StartModule } from './start';
import { SyncModule } from './sync';

@Module({
  imports: [
    IOModule,
    // commands:
    InitModule,
    StartModule,
    BuildModule,
    GenerateModule,
    SyncModule,
  ],
  providers: [CommandService],
})
export class CommandModule {}
