import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container';
import { IOModule, ProjectModule } from '../../core';
import { InitCommand } from './init.command';
import { InitModule } from './init.module';

describe('InitModule', () => {
  it('registers InitCommand as a command extension', () => {
    expect(getClassMetadata(InitModule, 'module')).toEqual({
      imports: [IOModule, ProjectModule],
      extensions: [InitCommand],
    });
  });
});
