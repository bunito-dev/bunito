import { describe, expect, it } from 'bun:test';
import { DECORATOR_METADATA_KEYS } from '../constants';
import { createComponentMethodDecorator } from './create-component-method-decorator';

const COMPONENT_KEY = Symbol('component');

describe('createComponentMethodDecorator', () => {
  it('stores component method metadata', () => {
    const metadata = {} as DecoratorMetadata;

    createComponentMethodDecorator(COMPONENT_KEY, { source: 'method' })(() => undefined, {
      metadata,
      name: 'handle',
    } as never);

    expect(
      (metadata[DECORATOR_METADATA_KEYS.COMPONENT_METHODS] as Map<symbol, unknown[]>).get(
        COMPONENT_KEY,
      ),
    ).toEqual([{ propKey: 'handle', options: { source: 'method' } }]);
  });
});
