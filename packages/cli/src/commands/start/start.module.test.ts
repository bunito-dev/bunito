import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container';
import { ProjectModule, RunnerModule } from '../../core';
import { StartCommand } from './start.command';
import { StartModule } from './start.module';

describe('StartModule', () => {
  it('registers StartCommand as a command extension', () => {
    expect(getClassMetadata(StartModule, 'module')).toEqual({
      imports: [ProjectModule, RunnerModule],
      extensions: [StartCommand],
    });
  });
});
