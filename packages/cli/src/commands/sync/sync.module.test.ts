import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container';
import { IOModule, ProjectModule } from '../../core';
import { SyncCommand } from './sync.command';
import { SyncModule } from './sync.module';

describe('SyncModule', () => {
  it('registers SyncCommand as a command extension', () => {
    expect(getClassMetadata(SyncModule, 'module')).toEqual({
      imports: [IOModule, ProjectModule],
      extensions: [SyncCommand],
    });
  });
});
