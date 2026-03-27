import * as process from 'node:process';
import { Provider } from '../container';
import type { EnvParser } from './types';

@Provider()
export class ConfigService {
  constructor() {
    this.whenCI = this.whenCI.bind(this);
    this.getEnv = this.getEnv.bind(this);
  }

  whenCI<TValue>(ciValue: TValue, nonCiValue: TValue): TValue {
    return process.env.CI === 'true' ? ciValue : nonCiValue;
  }

  getEnv(key: string): string | undefined;
  getEnv<TOutput = string>(key: string, parser: EnvParser<TOutput>): TOutput | undefined;
  getEnv(key: string, parser?: EnvParser<unknown>): unknown {
    const value = process.env[key];

    if (value === undefined) {
      return;
    }

    return parser ? parser(value) : value;
  }
}
