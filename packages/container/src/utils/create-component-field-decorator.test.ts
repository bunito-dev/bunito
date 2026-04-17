import { describe, expect, it } from 'bun:test';
import { DECORATOR_METADATA_KEYS } from '../constants';
import { createComponentFieldDecorator } from './create-component-field-decorator';

const COMPONENT_KEY = Symbol('component');

describe('createComponentFieldDecorator', () => {
  it('stores component field metadata', () => {
    const metadata = {} as DecoratorMetadata;

    createComponentFieldDecorator(COMPONENT_KEY, { source: 'field' })(undefined, {
      metadata,
      name: 'field',
    } as never);

    expect(
      (metadata[DECORATOR_METADATA_KEYS.COMPONENT_FIELDS] as Map<symbol, unknown[]>).get(
        COMPONENT_KEY,
      ),
    ).toEqual([{ propKey: 'field', options: { source: 'field' } }]);
  });
});
