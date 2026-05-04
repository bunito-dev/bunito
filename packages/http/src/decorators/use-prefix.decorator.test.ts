import { describe, expect, it } from 'bun:test';
import { getComponentMetadata } from '@bunito/container/internals';
import { Controller } from './controller.decorator';
import { UsePrefix } from './use-prefix.decorator';

describe('UsePrefix', () => {
  it('stores class-level route prefix metadata', () => {
    @UsePrefix('/v1')
    class ExampleController {}

    const props = getComponentMetadata(ExampleController)?.get(Controller)?.props ?? [];

    expect(props.at(0)?.value).toEqual({
      kind: 'prefix',
      prefix: '/v1',
    });
  });
});
