import { describe, expect, it } from 'bun:test';
import { getComponentMetadata } from '@bunito/container/internals';
import { Controller } from './controller.decorator';
import { Get } from './get.decorator';

describe('Get', () => {
  it('stores GET route metadata', () => {
    class ExampleController {
      @Get('/items', { injects: ['dependency'] })
      get(): void {
        //
      }
    }

    const props = getComponentMetadata(ExampleController)?.get(Controller)?.props ?? [];

    expect(props.at(0)?.value).toEqual({
      kind: 'route',
      options: {
        path: '/items',
        method: 'GET',
        injects: ['dependency'],
      },
    });
  });
});
