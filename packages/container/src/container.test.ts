import { describe, expect, it } from 'bun:test';
import { Container } from './container';
import type { ClassDecorator } from './decorators';
import { createComponentDecorator, Module } from './decorators';
import { Id } from './utils';

function Component(options?: unknown): ClassDecorator {
  return createComponentDecorator(Component, options);
}

describe('Container', () => {
  it('locates components through the compiled module graph', () => {
    @Component({ tag: 'child' })
    @Module({
      imports: [],
    })
    class ChildModule {}

    @Module({
      imports: [ChildModule],
    })
    class RootModule {}

    const container = new Container(RootModule);

    expect(container.locateComponents(Component)).toEqual({
      moduleId: Id.for(RootModule),
      children: [
        {
          moduleId: Id.for(ChildModule),
          components: [
            {
              useClass: ChildModule,
              options: {
                value: {
                  tag: 'child',
                },
              },
            },
          ],
        },
      ],
    });
  });
});
