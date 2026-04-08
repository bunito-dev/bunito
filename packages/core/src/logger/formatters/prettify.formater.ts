import type { InspectColor } from 'node:util';
import { inspect, styleText } from 'node:util';
import { isString } from '@bunito/common';
import type { ConfigService } from '../../config';
import { LogFormatter } from '../decorators';
import type { FormatLogOptions } from '../types';
import { PRETTIFY_LEVEL_THEMES } from './constants';
import type { PrettifyOptions } from './types';

@LogFormatter('prettify')
export class PrettifyFormater implements LogFormatter {
  constructor(private readonly options: Partial<PrettifyOptions> = {}) {}

  configure({ getEnvAs }: ConfigService): void {
    this.options.useColors = getEnvAs('USE_LOG_COLORS', 'boolean') ?? true;
    this.options.inspectDepth = getEnvAs('LOG_INSPECT_DEPTH', 'toInteger', [1, 20]) ?? 10;
  }

  formatLog(options: FormatLogOptions): string {
    const { timestamp, context, level, message, data, error, traceId, duration } =
      options;

    const buffer: string[] = [];

    const write = (text: string, ...colors: InspectColor[]): void => {
      buffer.push(
        this.options.useColors && colors.length ? styleText(colors, text) : text,
      );
    };

    const levelTheme = PRETTIFY_LEVEL_THEMES[level.kind];

    write(levelTheme.icon, levelTheme.colorSecondary);

    write(' ');
    write(timestamp, 'gray');

    write(' ');
    write(`${level.kind}`.padStart(7), levelTheme.colorPrimary);

    if (context) {
      write(' ');
      write(`[${context}]`, levelTheme.colorSecondary, 'bold');
    }

    if (message) {
      write(' ');
      write(message, levelTheme.colorMessage);
    }

    if (traceId) {
      write(' ');
      write(`#${traceId}`, 'gray', 'bold');
    }

    if (duration) {
      write(' ');
      write(`+${duration}ms`, 'gray', 'bold');
    }

    write('\n');

    if (error) {
      write(inspect(error, false, this.options.inspectDepth, this.options.useColors));
      write('\n');
    }

    if (data?.length) {
      for (const item of data) {
        let lines: string[];

        if (isString(item, false)) {
          lines = [item];
        } else {
          lines = inspect(item, false, this.options.inspectDepth, this.options.useColors)
            .split('\n')
            .filter(Boolean);
        }

        for (const line of lines) {
          write(`∙`, levelTheme.colorSecondary);
          write(' ');
          write(line);
          write('\n');
        }
      }
    }

    return buffer.join('');
  }
}
