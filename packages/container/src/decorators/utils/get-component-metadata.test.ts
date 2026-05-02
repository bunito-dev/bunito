import { describe, expect, it } from 'bun:test';
import { createComponentDecorator } from './create-component-decorator';
import { getComponentMetadata } from './get-component-metadata';

function Component() {
  return createComponentDecorator(Component, true);
}

describe('getComponentMetadata', () => {
  it('reads component metadata from classes and returns undefined otherwise', () => {
    @Component()
    class ExampleComponent {}

    class PlainClass {}

    expect(getComponentMetadata(ExampleComponent)?.has(Component)).toBeTrue();
    expect(getComponentMetadata(PlainClass)).toBeUndefined();
  });
});
