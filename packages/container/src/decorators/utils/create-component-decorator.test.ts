import { describe, expect, it } from 'bun:test';
import { Provider } from '../provider.decorator';
import type {
  ClassDecorator as BunitoClassDecorator,
  ClassPropDecorator,
  ProviderDecoratorOptions,
} from '../types';
import { createComponentDecorator } from './create-component-decorator';
import { getComponentMetadata } from './get-component-metadata';
import { getProviderMetadata } from './get-provider-metadata';

function Component(options?: unknown): BunitoClassDecorator {
  return createComponentDecorator(Component, options);
}

function ProviderComponent(
  options?: unknown,
  providerOptions?: ProviderDecoratorOptions,
): BunitoClassDecorator {
  return createComponentDecorator(ProviderComponent, options, providerOptions);
}

function Prop(options?: unknown): ClassPropDecorator {
  return createComponentDecorator(Prop, options, Prop);
}

describe('createComponentDecorator', () => {
  it('stores class, field, and method component metadata', () => {
    @Component({ name: 'component' })
    @Prop({ name: 'class-prop' })
    class ExampleComponent {
      @Prop({ name: 'field-prop' })
      field = 'value';

      @Prop({ name: 'method-prop' })
      method(): void {
        //
      }
    }

    expect(getComponentMetadata(ExampleComponent)?.get(Component)).toEqual({
      value: { name: 'component' },
    });
    expect(getComponentMetadata(ExampleComponent)?.get(Prop)).toEqual({
      props: [
        {
          propKind: 'method',
          propKey: 'method',
          value: { name: 'method-prop' },
        },
        {
          propKind: 'field',
          propKey: 'field',
          value: { name: 'field-prop' },
        },
        {
          propKind: 'class',
          value: { name: 'class-prop' },
        },
      ],
    });
  });

  it('rejects duplicate class component metadata', () => {
    class DuplicateComponent {}

    const metadata = {};
    const context = {
      kind: 'class',
      name: 'DuplicateComponent',
      metadata,
    } as ClassDecoratorContext;

    const decorator = Component();

    decorator(DuplicateComponent, context);

    expect(() => {
      decorator(DuplicateComponent, context);
    }).toThrow('@Component() decorator can only be applied once');
  });

  it('stores provider metadata for class components and rejects provider conflicts', () => {
    @ProviderComponent({ name: 'component' }, { scope: 'module' })
    class ComponentProvider {}

    expect(getComponentMetadata(ComponentProvider)?.get(ProviderComponent)).toEqual({
      value: { name: 'component' },
    });
    expect(getProviderMetadata(ComponentProvider)?.options).toEqual({
      scope: 'module',
    });

    expect(() => {
      @ProviderComponent({ name: 'component' }, { scope: 'module' })
      @Provider()
      class ProviderConflict {}

      return ProviderConflict;
    }).toThrow('@ProviderComponent() decorator conflicts with @Provider() decorator');
  });
});
