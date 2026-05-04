import { describe, expect, it } from 'bun:test';
import { getComponentMetadata } from '@bunito/container/internals';
import { Controller } from './controller.decorator';
import { UseMiddleware } from './use-middleware.decorator';

describe('UseMiddleware', () => {
  it('stores class-level middleware metadata', () => {
    class ExampleMiddleware {}

    @UseMiddleware(ExampleMiddleware, { enabled: true })
    class ExampleController {}

    const props = getComponentMetadata(ExampleController)?.get(Controller)?.props ?? [];

    expect(props.at(0)?.value).toEqual({
      kind: 'middleware',
      middleware: ExampleMiddleware,
      options: {
        enabled: true,
      },
    });
  });
});
