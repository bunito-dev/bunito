import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container';
import { IOModule } from '../core';
import { BuildModule } from './build';
import { CommandModule } from './command.module';
import { CommandService } from './command.service';
import { GenerateModule } from './generate';
import { InitModule } from './init';
import { StartModule } from './start';
import { SyncModule } from './sync';

describe('CommandModule', () => {
  it('registers command modules and the command service', () => {
    expect(getClassMetadata(CommandModule, 'module')).toEqual({
      imports: [
        IOModule,
        InitModule,
        StartModule,
        BuildModule,
        GenerateModule,
        SyncModule,
      ],
      providers: [CommandService],
    });
  });
});
