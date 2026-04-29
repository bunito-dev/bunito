import { describe, expect, it } from 'bun:test';
import * as metadata from './index';

describe('metadata index', () => {
  it('re-exports metadata helpers', () => {
    expect(metadata.getClassMetadata).toBeFunction();
    expect(metadata.initClassMetadata).toBeFunction();
    expect(metadata.setClassDecoratorMetadata).toBeFunction();
  });
});
