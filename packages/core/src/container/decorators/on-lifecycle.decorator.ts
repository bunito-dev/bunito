import type { ClassMethodDecorator, Fn } from '@bunito/common';
import { DECORATOR_METADATA_KEYS } from '../constants';
import type { ProviderEvent, ProviderEvents } from '../types';

export function OnLifecycle<THandler extends Fn>(
  event: ProviderEvent,
): ClassMethodDecorator<THandler> {
  return (target, { metadata, name: propKey }) => {
    metadata[DECORATOR_METADATA_KEYS.PROVIDER_EVENTS] ??= {};

    (metadata[DECORATOR_METADATA_KEYS.PROVIDER_EVENTS] as ProviderEvents)[event] =
      propKey;

    return target;
  };
}

// aliases

export const OnInit = () => OnLifecycle('onInit');

export const OnDestroy = () => OnLifecycle('onDestroy');

export const OnBoot = () => OnLifecycle('onBoot');

export const OnResolve = () => OnLifecycle('onResolve');
