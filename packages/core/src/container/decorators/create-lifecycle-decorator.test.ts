import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/common';
import { DECORATOR_METADATA_KEYS } from '../constants';
import { createLifecycleDecorator } from './create-lifecycle-decorator';

describe('createLifecycleDecorator', () => {
  it('should add and extend lifecycle metadata on the target', () => {
    const onInit = createLifecycleDecorator('onInit');
    const onDestroy = createLifecycleDecorator('onDestroy');
    const target = () => undefined;
    const metadata = {} as DecoratorMetadataObject;

    onInit()(target as never, {
      name: 'setup',
      metadata,
    } as ClassMethodDecoratorContext);
    onDestroy()(target as never, {
      name: 'cleanup',
      metadata,
    } as ClassMethodDecoratorContext);

    expect(
      metadata[DECORATOR_METADATA_KEYS.lifecycle],
    ).toEqual(
      new Map([
        ['onInit', 'setup'],
        ['onDestroy', 'cleanup'],
      ]),
    );
  });
});
