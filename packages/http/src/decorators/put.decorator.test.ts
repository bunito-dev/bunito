import { describe, expect, it } from 'bun:test';
import { getComponentMetadata } from '@bunito/container/internals';
import { Controller } from './controller.decorator';
import { Put } from './put.decorator';

describe('Put', () => {
  it('stores PUT route metadata with a default path', () => {
    class ExampleController {
      @Put()
      put(): void {
        //
      }
    }

    const props = getComponentMetadata(ExampleController)?.get(Controller)?.props ?? [];

    expect(props.at(0)?.value).toEqual({
      kind: 'route',
      options: {
        path: '/',
        method: 'PUT',
      },
    });
  });
});
