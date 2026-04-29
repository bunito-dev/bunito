import { describe, expect, it } from 'bun:test';
import { CLASS_METADATA_KEY } from '../constants';
import { initClassMetadata } from './init-class-metadata';

describe('initClassMetadata', () => {
  it('creates and reuses metadata buckets on classes and functions', () => {
    class Example {}
    function factory() {
      return 'value';
    }

    const classMetadata = initClassMetadata<{ enabled: boolean }>(Example);
    classMetadata.options = new Map([[factory, { enabled: true }]]);

    expect(initClassMetadata(Example)).toBe(classMetadata);
    expect(Example[Symbol.metadata]?.[CLASS_METADATA_KEY]).toBe(classMetadata);

    const factoryMetadata = initClassMetadata(factory);
    expect(factoryMetadata).toBe(
      factory[Symbol.metadata]?.[CLASS_METADATA_KEY] as typeof factoryMetadata,
    );
  });
});
