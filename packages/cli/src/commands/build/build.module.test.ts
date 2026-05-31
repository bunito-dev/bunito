import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container';
import { IOModule, ProjectModule } from '../../core';
import { BuildCommand } from './build.command';
import { BuildModule } from './build.module';

describe('BuildModule', () => {
  it('registers BuildCommand as a command extension', () => {
    expect(getClassMetadata(BuildModule, 'module')).toEqual({
      imports: [IOModule, ProjectModule],
      extensions: [BuildCommand],
    });
  });
});
