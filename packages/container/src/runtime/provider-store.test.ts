import { describe, expect, it } from 'bun:test';
import { Id } from '../utils';
import { ProviderStore } from './provider-store';

describe('ProviderStore', () => {
  it('stores provider instances by module and runs lifecycle handlers', async () => {
    const store = new ProviderStore();
    const providerId = Id.unique('Provider');
    const moduleId = Id.unique('Module');
    const events: string[] = [];

    store.setInstance(
      providerId,
      { value: 1 },
      {
        moduleId,
        onResolve: async () => {
          events.push('resolve:first');
        },
        onDestroy: async () => {
          events.push('destroy:first');
        },
      },
    );

    const first = await store.getInstance<{ value: number }>(providerId, { moduleId });

    store.setInstance(
      providerId,
      { value: 2 },
      {
        moduleId,
        onDestroy: async () => {
          events.push('destroy:second');
        },
      },
    );

    await Bun.sleep(1);

    const second = await store.getInstance<{ value: number }>(providerId, { moduleId });

    await store.destroyInstances();
    await store.destroyInstances();

    expect(first).toEqual({ value: 1 });
    expect(second).toEqual({ value: 2 });
    expect(events).toEqual(['resolve:first', 'destroy:first', 'destroy:second']);
  });

  it('ignores destroy errors when replacing an existing provider instance', async () => {
    const store = new ProviderStore();
    const providerId = Id.unique('Provider');
    const events: string[] = [];

    store.setInstance(
      providerId,
      { value: 1 },
      {
        onDestroy: () => {
          events.push('destroy:first');
          return Promise.reject(new Error('Destroy failed.'));
        },
      },
    );

    store.setInstance(
      providerId,
      { value: 2 },
      {
        onDestroy: async () => {
          events.push('destroy:second');
        },
      },
    );

    await Bun.sleep(1);
    await store.destroyInstances();

    expect(events).toEqual(['destroy:first', 'destroy:second']);
  });

  it('stores provider instances in the global module by default', async () => {
    const store = new ProviderStore();
    const providerId = Id.unique('Provider');

    store.setInstance(providerId, { value: 'global' });

    const instance = await store.getInstance<{ value: string }>(providerId);

    expect(instance).toEqual({ value: 'global' });
  });

  it('clears destroy handlers when instance destruction fails', async () => {
    const store = new ProviderStore();
    const providerId = Id.unique('Provider');

    store.setInstance(
      providerId,
      {},
      {
        onDestroy: async () => {
          throw new Error('Destroy failed.');
        },
      },
    );

    try {
      await store.destroyInstances();
      throw new Error('Expected destroyInstances to reject.');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Destroy failed.');
    }

    await store.destroyInstances();
  });

  it('returns undefined when no instance exists', async () => {
    const store = new ProviderStore();
    const instance = await store.getInstance(Id.unique('Provider'));

    expect(instance).toBeUndefined();

    await store.destroyInstances();
  });
});
