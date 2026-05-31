import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container';
import { IOModule } from '../io';
import { ProjectModule } from './project.module';
import { ProjectService } from './project.service';

describe('ProjectModule', () => {
  it('registers and exports ProjectService', () => {
    expect(getClassMetadata(ProjectModule, 'module')).toEqual({
      imports: [IOModule],
      providers: [ProjectService],
      exports: [ProjectService],
    });
  });
});
