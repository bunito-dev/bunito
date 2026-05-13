import type { Fn } from '@bunito/common';
import type { ModuleId, ProviderId } from '../compiler';
import { GLOBAL_MODULE_ID } from './constants';
import type {
  GetProviderInstanceOptions,
  ProviderInstance,
  SetProviderInstanceOptions,
} from './types';

export class ProviderStore {
  private instances: WeakMap<ModuleId, WeakMap<ProviderId, ProviderInstance>> | undefined;

  private destroyHandlers: Set<Fn<Promise<void>>> | undefined;

  private staleDestroyPromises: Promise<PromiseSettledResult<void>[]>[] | undefined;

  // biome-ignore lint/complexity/noUselessConstructor: Bun coverage misses classes with private fields without an explicit constructor.
  constructor() {}

  async getInstance<TInstance = unknown>(
    providerId: ProviderId,
    options: GetProviderInstanceOptions = {},
  ): Promise<TInstance | undefined> {
    const { moduleId = GLOBAL_MODULE_ID } = options;

    const provider = this.instances?.get(moduleId)?.get(providerId);

    if (provider === undefined) {
      return;
    }

    const { onResolve, instance } = provider;

    if (onResolve) {
      await onResolve();
    }

    return instance as TInstance;
  }

  setInstance<TInstance = unknown>(
    providerId: ProviderId,
    instance: TInstance,
    options: SetProviderInstanceOptions = {},
  ): void {
    const { moduleId = GLOBAL_MODULE_ID, onResolve, onDestroy } = options;

    this.instances ??= new WeakMap();

    let instances = this.instances.get(moduleId);

    if (!instances) {
      instances = new WeakMap();
      this.instances.set(moduleId, instances);
    }

    const existingOnDestroy = instances.get(providerId)?.onDestroy;

    if (existingOnDestroy) {
      this.staleDestroyPromises ??= [];
      this.staleDestroyPromises.push(Promise.allSettled([existingOnDestroy()]));
      this.destroyHandlers?.delete(existingOnDestroy);
    }

    instances.set(providerId, {
      instance,
      onResolve,
      onDestroy,
    });

    if (onDestroy) {
      this.destroyHandlers ??= new Set();
      this.destroyHandlers.add(onDestroy);
    }
  }

  async destroyInstances(): Promise<void> {
    if (!this.destroyHandlers && !this.staleDestroyPromises) {
      return;
    }

    const destroyPromises: Promise<void>[] = [];

    for (const destroyHandler of this.destroyHandlers?.values() ?? []) {
      destroyPromises.push(destroyHandler());
    }

    try {
      await Promise.all([...(this.staleDestroyPromises ?? []), ...destroyPromises]);
    } finally {
      this.destroyHandlers = undefined;
      this.staleDestroyPromises = undefined;
    }
  }
}
