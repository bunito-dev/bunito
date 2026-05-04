import { describe, expect, it } from 'bun:test';
import { getComponentMetadata } from '@bunito/container/internals';
import { Controller } from './controller.decorator';
import { Post } from './post.decorator';

describe('Post', () => {
  it('stores POST route metadata from options', () => {
    class ExampleController {
      @Post({ path: '/items', injects: ['dependency'] })
      post(): void {
        //
      }
    }

    const props = getComponentMetadata(ExampleController)?.get(Controller)?.props ?? [];

    expect(props.at(0)?.value).toEqual({
      kind: 'route',
      options: {
        path: '/items',
        method: 'POST',
        injects: ['dependency'],
      },
    });
  });
});
