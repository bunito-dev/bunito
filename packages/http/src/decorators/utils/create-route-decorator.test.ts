import { describe, expect, it } from 'bun:test';
import { getComponentMetadata } from '@bunito/container/internals';
import { Controller } from '../controller.decorator';
import { createRouteDecorator } from './create-route-decorator';

describe('createRouteDecorator', () => {
  it('creates route decorators from paths, options, and defaults', () => {
    const Patch = createRouteDecorator.bind(null, function Patch() {}, 'PATCH');

    class ExampleController {
      @Patch('/path', { injects: ['path'] })
      path(): void {
        //
      }

      @Patch({ path: '/options', injects: ['options'] })
      options(): void {
        //
      }

      @Patch()
      defaultPath(): void {
        //
      }
    }

    const props = getComponentMetadata(ExampleController)?.get(Controller)?.props ?? [];

    expect(props.map((prop) => prop.value)).toEqual([
      {
        kind: 'route',
        options: {
          path: '/path',
          method: 'PATCH',
          injects: ['path'],
        },
      },
      {
        kind: 'route',
        options: {
          path: '/options',
          method: 'PATCH',
          injects: ['options'],
        },
      },
      {
        kind: 'route',
        options: {
          path: '/',
          method: 'PATCH',
        },
      },
    ]);
  });
});
