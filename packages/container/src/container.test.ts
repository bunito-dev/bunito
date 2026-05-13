import { describe, expect, it } from 'bun:test';
import { Container } from './container';
import type { ClassMethodDecorator } from './decorators';
import { Controller, createClassPropDecorator, Module, UsePrefix } from './decorators';
import { Id } from './utils';

describe('Container', () => {
  it('locates controller props through the compiled module graph', () => {
    const customControllerKey = Symbol('custom');

    function CustomHandler(): ClassMethodDecorator {
      return createClassPropDecorator(customControllerKey, {
        kind: 'custom-handler',
      });
    }

    @Controller('/items')
    @UsePrefix('/child')
    class ChildController {
      @CustomHandler()
      handle(): void {
        //
      }
    }

    @Module({
      providers: [ChildController],
    })
    class ChildModule {}

    @UsePrefix('/root')
    @Module({
      imports: [ChildModule],
    })
    class RootModule {}

    const container = new Container(RootModule);

    expect(container.locateComponents(customControllerKey)).toEqual({
      moduleId: Id.for(RootModule),
      props: [
        {
          propKind: 'class',
          options: {
            kind: 'prefix',
            prefix: '/root',
          },
        },
      ],
      children: [
        {
          moduleId: Id.for(ChildModule),
          controllers: [
            {
              providerId: Id.for(ChildController),
              options: {
                prefix: '/items',
              },
              props: [
                {
                  propKind: 'class',
                  options: {
                    kind: 'prefix',
                    prefix: '/child',
                  },
                },
                {
                  propKind: 'method',
                  propKey: 'handle',
                  options: {
                    kind: 'custom-handler',
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });
});
