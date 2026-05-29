import * as process from 'node:process';
import type { RawObject } from '@bunito/common';
import type { ProviderValueOptions } from '@bunito/container';
import { CONFIG_ENVS_ID } from '../constants';
import type { ConfigEnv } from '../types';

export function overwriteConfigEnvs(
  envs: Record<string, string>,
  addExisting: false,
): ProviderValueOptions;
export function overwriteConfigEnvs(
  envs: Record<string, string>,
  ...existingNames: ConfigEnv[]
): ProviderValueOptions;
export function overwriteConfigEnvs(
  envs: Record<string, string>,
  ...args: (ConfigEnv | false)[]
): ProviderValueOptions {
  let base: RawObject = {};

  if (args[0] === undefined) {
    base = process.env;
  } else if (args[0] !== false) {
    for (const name of args) {
      if (name) {
        base[name] = process.env[name];
      }
    }
  }

  return {
    token: CONFIG_ENVS_ID,
    global: true,
    useValue: {
      ...base,
      ...envs,
    },
  };
}
