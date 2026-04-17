import { describe, expect, it } from 'bun:test';
import { DECORATOR_METADATA_KEYS } from '../constants';
import {
  OnBoot,
  OnDestroy,
  OnInit,
  OnLifecycle,
  OnResolve,
} from './on-lifecycle.decorator';

describe('OnLifecycle', () => {
  it('stores event handler metadata', () => {
    const metadata = {} as DecoratorMetadata;

    OnLifecycle('onInit')(() => undefined, {
      metadata,
      name: 'onInit',
    } as never);
    OnBoot()(() => undefined, {
      metadata,
      name: 'onBoot',
    } as never);
    OnDestroy()(() => undefined, {
      metadata,
      name: 'onDestroy',
    } as never);
    OnInit()(() => undefined, {
      metadata,
      name: 'onInitAlias',
    } as never);
    OnResolve()(() => undefined, {
      metadata,
      name: 'onResolve',
    } as never);

    expect(metadata[DECORATOR_METADATA_KEYS.PROVIDER_EVENTS]).toEqual({
      onInit: 'onInitAlias',
      onBoot: 'onBoot',
      onDestroy: 'onDestroy',
      onResolve: 'onResolve',
    });
  });
});
