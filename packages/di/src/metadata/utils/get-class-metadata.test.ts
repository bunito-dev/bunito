import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from './get-class-metadata';
import { initClassMetadata } from './init-class-metadata';

describe('getClassMetadata', () => {
  it('reads metadata from classes, functions, and instances', () => {
    class Example {}
    function marker() {
      return undefined;
    }

    const metadata = initClassMetadata<{ tag: string }>(Example);
    metadata.options = new Map([[marker, { tag: 'example' }]]);

    expect(getClassMetadata(Example)).toBe(metadata);
    expect(getClassMetadata(new Example())).toBe(metadata);
    expect(getClassMetadata(marker)).toBeUndefined();
    expect(getClassMetadata('not-an-object' as never)).toBeUndefined();
  });
});
