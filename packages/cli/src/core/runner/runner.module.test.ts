import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container';
import { RunnerModule } from './runner.module';
import { RunnerService } from './runner.service';

describe('RunnerModule', () => {
  it('registers and exports RunnerService', () => {
    expect(getClassMetadata(RunnerModule, 'module')).toEqual({
      providers: [RunnerService],
      exports: [RunnerService],
    });
  });
});
