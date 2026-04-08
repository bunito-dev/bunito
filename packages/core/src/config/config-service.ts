import * as process from 'node:process';
import { isFn, isObject, isString } from '@bunito/common';
import { Provider } from '../container';
import type {
  ConfigEnvKey,
  ConfigEnvKeysLike,
  ConfigValueFormat,
  ConfigValueNumberFormat,
  ConfigValueNumberOptions,
  ConfigValueParser,
  ConfigValueStringFormat,
} from './types';

@Provider({
  scope: 'singleton',
})
export class ConfigService {
  readonly isCI = process.env.CI === 'true';

  constructor() {
    this.getEnv = this.getEnv.bind(this);
    this.getEnvAs = this.getEnvAs.bind(this);
  }

  getEnv(keysLike: ConfigEnvKeysLike): string | undefined;
  getEnv<TOutput = string>(
    keysLike: ConfigEnvKeysLike,
    parser: ConfigValueParser<TOutput>,
  ): TOutput | undefined;
  getEnv(keysLike: ConfigEnvKeysLike, parser?: ConfigValueParser): unknown {
    const value = this.getRawEnv(keysLike);

    if (!value) {
      return;
    }

    if (!parser) {
      return value;
    }

    if (isFn(parser)) {
      return parser(value);
    }

    if (isObject(parser) && 'safeParse' in parser) {
      const parsed = parser.safeParse(value);

      if (parsed.success) {
        return parsed.data;
      }
    }
  }

  getEnvAs(keysLike: ConfigEnvKeysLike, format: 'boolean'): boolean | undefined;
  getEnvAs(keysLike: ConfigEnvKeysLike, format: 'port'): number | undefined;
  getEnvAs(
    keysLike: ConfigEnvKey,
    format: ConfigValueNumberFormat,
    options?: ConfigValueNumberOptions,
  ): number | undefined;
  getEnvAs<TValue extends string>(
    keysLike: ConfigEnvKey,
    format: ConfigValueStringFormat,
    options?: ArrayLike<string>,
  ): TValue | undefined;
  getEnvAs(
    keysLike: ConfigEnvKey,
    format: ConfigValueFormat,
    options?: unknown,
  ): unknown {
    const value = this.getRawEnv(keysLike);

    if (!value) {
      return;
    }

    return this.formatValueAs(value, format, options);
  }

  private getRawEnv(keysLike: ConfigEnvKeysLike): string | undefined {
    if (isString(keysLike)) {
      return process.env[keysLike]?.trim();
    }

    if (Array.isArray(keysLike)) {
      for (const key of keysLike) {
        const value = process.env[key]?.trim();

        if (value) {
          return value;
        }
      }
    }
  }

  private formatValueAs(
    value: string,
    format: ConfigValueFormat,
    options: unknown,
  ): unknown {
    switch (format) {
      case 'boolean':
        return this.formatValueAsBoolean(value);

      case 'toDecimal':
      case 'toInteger':
        return this.formatValueAsNumber(
          value,
          format,
          options as ConfigValueNumberOptions | undefined,
        );

      case 'port':
        return this.formatValueAsNumber(value, 'toInteger', [1, 65535]);

      case 'string':
      case 'toUpperCase':
      case 'toLowerCase':
        return this.formatValueAsString(value, format, options as string[] | undefined);
    }
  }

  private formatValueAsBoolean(value: string): boolean | undefined {
    switch (value.toLowerCase()) {
      case 'true':
      case 't':
      case 'yes':
      case 'y':
      case 'on':
        return true;

      case 'false':
      case 'f':
      case 'no':
      case 'n':
      case 'off':
        return false;

      default:
        return;
    }
  }

  private formatValueAsNumber(
    value: string,
    format: ConfigValueNumberFormat,
    options: ConfigValueNumberOptions | undefined,
  ): number | undefined {
    let result: number | undefined;

    const prepared = value.replace(/_/g, '');

    switch (format) {
      case 'toDecimal':
        result = Number.parseFloat(prepared);
        break;

      case 'toInteger':
        result = Number.parseInt(prepared, 10);
        break;
    }

    if (Number.isNaN(result)) {
      return;
    }

    if (isObject(options)) {
      const [min, max] = options;

      if (min !== undefined && result < min) {
        return;
      }

      if (max !== undefined && result > max) {
        return;
      }
    }

    return result;
  }

  private formatValueAsString(
    value: string,
    format: ConfigValueStringFormat,
    options: ArrayLike<string> | undefined,
  ): string | undefined {
    let result: string;

    switch (format) {
      case 'string':
        result = value;
        break;

      case 'toUpperCase':
        result = value.toUpperCase();
        break;

      case 'toLowerCase':
        result = value.toLowerCase();
        break;
    }

    if (Array.isArray(options) && !options.includes(result)) {
      return;
    }

    return result;
  }
}
