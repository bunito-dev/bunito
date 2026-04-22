import type { Fn, MaybePromise } from '@bunito/common';
import { ConfigurationException } from '@bunito/common';
import type { ProviderEventName } from '../types';
import { DECORATOR_METADATA_KEYS } from './constants';
import type { ClassMethodDecorator, ProviderMetadata } from './types';

export function ProviderEvent(
  name: ProviderEventName,
  disposable = false,
): ClassMethodDecorator<Fn<MaybePromise<void>>> {
  return (target, context) => {
    const { metadata, name: propKey } = context;

    metadata[DECORATOR_METADATA_KEYS.provider] ??= {};

    const providerMetadata = context.metadata[
      DECORATOR_METADATA_KEYS.provider
    ] as ProviderMetadata;

    providerMetadata.events ??= {};

    if (providerMetadata.events[name]) {
      ConfigurationException.throw`@${name}() decorator already exists in ${target}`;
    }

    providerMetadata.events[name] = {
      disposable,
      propKey,
    };

    return target;
  };
}

// aliases

export const OnBoot = () => ProviderEvent('OnBoot', true);

export const OnInit = () => ProviderEvent('OnInit', true);

export const OnResolve = () => ProviderEvent('OnResolve');

export const OnDestroy = () => ProviderEvent('OnDestroy', true);
