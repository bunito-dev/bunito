import * as process from 'node:process';
import { PROCESS_ENV } from './constants';
import type { EnvKey } from './types';

export function restoreEnvs(...keys: EnvKey[]): void {
  for (const key of keys.length > 0 ? keys : Object.keys(process.env)) {
    delete process.env[key];
    process.env[key] = PROCESS_ENV[key];
  }
}
