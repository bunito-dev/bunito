import { describe, expect, it } from 'bun:test';
import { getComponentMetadata } from '@bunito/container/internals';
import { Controller } from './controller.decorator';
import { Route } from './route.decorator';

describe('Route', () => {
  it('stores ALL route metadata', () => {
    class ExampleController {
      @Route('/items', { injects: ['dependency'] })
      route(): void {
        //
      }
    }

    const props = getComponentMetadata(ExampleController)?.get(Controller)?.props ?? [];

    expect(props.at(0)?.value).toEqual({
      kind: 'route',
      options: {
        path: '/items',
        method: 'ALL',
        injects: ['dependency'],
      },
    });
  });
});
