import { describe, expect, it } from 'bun:test';
import { getComponentMetadata } from '@bunito/container/internals';
import { Controller } from './controller.decorator';
import { Delete } from './delete.decorator';

describe('Delete', () => {
  it('stores DELETE route metadata', () => {
    class ExampleController {
      @Delete('/items')
      delete(): void {
        //
      }
    }

    const props = getComponentMetadata(ExampleController)?.get(Controller)?.props ?? [];

    expect(props.at(0)?.value).toEqual({
      kind: 'route',
      options: {
        path: '/items',
        method: 'DELETE',
      },
    });
  });
});
