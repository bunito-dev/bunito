import * as process from 'node:process';
import { isFn, isObject, isString } from '@bunito/common';
import { Provider } from '../container';
import type {
  EnvKeyLike,
  ValueFormat,
  ValueNumberFormat,
  ValueNumberOptions,
  ValueParser,
  ValueStringFormat,
} from './types';
import { formatValueAs } from './utils';

@Provider({
  scope: 'singleton',
})
export class ConfigService {
  readonly isCI = process.env.CI === 'true';

  constructor() {
    this.getEnv = this.getEnv.bind(this);
  }

  getEnv(keyLike: EnvKeyLike): string | undefined;
  getEnv(keyLike: EnvKeyLike, format: 'boolean'): boolean | undefined;
  getEnv(keyLike: EnvKeyLike, format: 'port'): number | undefined;
  getEnv(
    keyLike: EnvKeyLike,
    format: ValueNumberFormat,
    options?: ValueNumberOptions,
  ): number | undefined;
  getEnv<TValue extends string>(
    keyLike: EnvKeyLike,
    format: ValueStringFormat,
    options?: ArrayLike<string>,
  ): TValue | undefined;
  getEnv<TOutput = string>(
    keyLike: EnvKeyLike,
    parser: ValueParser<TOutput>,
  ): TOutput | undefined;
  getEnv(
    keyLike: EnvKeyLike,
    formatOrParser?: ValueFormat | ValueParser,
    formatOptions?: unknown,
  ): unknown {
    const value = this.getRawEnv(keyLike);

    if (!value) {
      return;
    }

    if (!formatOrParser) {
      return value;
    }

    if (isFn(formatOrParser)) {
      return formatOrParser(value);
    }

    if (isObject(formatOrParser) && 'safeParse' in formatOrParser) {
      const parsed = formatOrParser.safeParse(value);

      if (parsed.success) {
        return parsed.data;
      }
    }

    return formatValueAs(value, formatOrParser as ValueFormat, formatOptions);
  }

  private getRawEnv(keyLike: EnvKeyLike): string | undefined {
    if (isString(keyLike)) {
      return process.env[keyLike]?.trim();
    }

    if (Array.isArray(keyLike)) {
      for (const key of keyLike) {
        const value = this.getRawEnv(key);

        if (value) {
          return value;
        }
      }
    }
  }
}
