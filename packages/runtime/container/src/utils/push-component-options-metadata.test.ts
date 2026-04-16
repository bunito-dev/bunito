import { describe, expect, it } from 'bun:test';
import { DECORATOR_METADATA_KEYS } from '../constants';
import { pushComponentOptionsMetadata } from './push-component-options-metadata';

const COMPONENT_KEY = Symbol('component');

describe('pushComponentOptionsMetadata', () => {
  it('appends options for a component key', () => {
    const metadata = {} as DecoratorMetadata;

    pushComponentOptionsMetadata(metadata, COMPONENT_KEY, { path: '/a' });
    pushComponentOptionsMetadata(metadata, COMPONENT_KEY, { path: '/b' });

    expect(
      (metadata[DECORATOR_METADATA_KEYS.COMPONENT_OPTIONS] as Map<symbol, unknown[]>).get(
        COMPONENT_KEY,
      ),
    ).toEqual([{ path: '/a' }, { path: '/b' }]);
  });
});
