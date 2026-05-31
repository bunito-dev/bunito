import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container';
import { IOModule } from './io.module';
import { IOService } from './io.service';

describe('IOModule', () => {
  it('registers and exports IOService', () => {
    expect(getClassMetadata(IOModule, 'module')).toEqual({
      providers: [IOService],
      exports: [IOService],
    });
  });
});
