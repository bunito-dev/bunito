import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container';
import { IOModule, ProjectModule } from '../../core';
import { GenerateCommand } from './generate.command';
import { GenerateModule } from './generate.module';

describe('GenerateModule', () => {
  it('registers GenerateCommand as a command extension', () => {
    expect(getClassMetadata(GenerateModule, 'module')).toEqual({
      imports: [IOModule, ProjectModule],
      extensions: [GenerateCommand],
    });
  });
});
