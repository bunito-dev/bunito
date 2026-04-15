import { describe, expect, it } from 'bun:test';
import { DECORATOR_METADATA_KEYS } from '../constants';
import { createComponentDecorator } from './create-component-decorator';

const COMPONENT_KEY = Symbol('component');

describe('createComponentDecorator', () => {
  it('stores component keys, options and provider metadata', () => {
    class Example {}

    const metadata = {} as DecoratorMetadata;

    createComponentDecorator(
      COMPONENT_KEY,
      { kind: 'path', path: '/test' },
      {
        scope: 'module',
      },
    )(Example, { metadata } as never);

    expect(metadata[DECORATOR_METADATA_KEYS.COMPONENT_KEYS]).toEqual(
      new Set([COMPONENT_KEY]),
    );
    expect(
      (metadata[DECORATOR_METADATA_KEYS.COMPONENT_OPTIONS] as Map<symbol, unknown[]>).get(
        COMPONENT_KEY,
      ),
    ).toEqual([{ kind: 'path', path: '/test' }]);
    expect(metadata[DECORATOR_METADATA_KEYS.PROVIDER_OPTIONS]).toEqual({
      scope: 'module',
    });
  });
});
