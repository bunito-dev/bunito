import { describe, expect, it } from 'bun:test';
import { DECORATOR_METADATA_KEYS } from '../constants';
import { createComponentOptionsDecorator } from './create-component-options-decorator';

const COMPONENT_KEY = Symbol('component');

describe('createComponentOptionsDecorator', () => {
  it('stores component options metadata', () => {
    class Example {}

    const metadata = {} as DecoratorMetadata;

    createComponentOptionsDecorator(COMPONENT_KEY, { kind: 'path', path: '/module' })(
      Example,
      { metadata } as never,
    );

    expect(
      (metadata[DECORATOR_METADATA_KEYS.COMPONENT_OPTIONS] as Map<symbol, unknown[]>).get(
        COMPONENT_KEY,
      ),
    ).toEqual([{ kind: 'path', path: '/module' }]);
  });
});
