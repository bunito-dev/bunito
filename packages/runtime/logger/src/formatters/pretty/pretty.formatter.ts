import type { InspectColor } from 'node:util';
import { inspect, styleText } from 'node:util';
import { isString } from '@bunito/common';
import type { ResolveConfig } from '@bunito/config';
import { Formatter } from '../formatter.decorator';
import type { FormatterExtension } from '../formatter.extension';
import type { FormatLogOptions } from '../types';
import { PRETTY_LEVEL_THEMES } from './constants';
import { PrettyConfig } from './pretty.config';
import { formatDuration } from './utils';

@Formatter('pretty', {
  injects: [PrettyConfig],
})
export class PrettyFormatter implements FormatterExtension {
  constructor(private readonly config: ResolveConfig<typeof PrettyConfig>) {}

  formatLog(options: FormatLogOptions): string {
    const { timestamp, context, level, message, data, error, traceId, duration } =
      options;

    const buffer: string[] = [];

    const write = (text: string, ...colors: InspectColor[]): void => {
      buffer.push(this.config.colors && colors.length ? styleText(colors, text) : text);
    };

    const levelTheme = PRETTY_LEVEL_THEMES[level.name];

    write(levelTheme.icon, levelTheme.primary);

    write(' ');
    write(timestamp, 'gray');

    write(' ');
    write(`${level.name}`.padStart(7), levelTheme.primary);

    if (context) {
      write(' ');
      write(`[${context ?? 'Unknown'}]`, levelTheme.secondary, 'bold');
    }

    if (traceId) {
      write(' ');
      write(`#${traceId}`, 'gray', 'bold');
    }

    if (message) {
      write(' ');
      write(message, levelTheme.text);
    }

    if (duration !== undefined) {
      write(' ');
      write(formatDuration(duration), 'gray', 'bold');
    }

    if (error) {
      write('\n');
      write(inspect(error, false, this.config.inspectDepth, this.config.colors));
    }

    if (data?.length) {
      for (const item of data) {
        let lines: string[];

        if (isString(item, false)) {
          lines = [item];
        } else {
          lines = inspect(item, false, this.config.inspectDepth, this.config.colors)
            .split('\n')
            .filter(Boolean);
        }

        for (const line of lines) {
          write('\n');
          write(`∙`, levelTheme.secondary);
          write(' ');
          write(line);
        }
      }
    }

    return buffer.join('');
  }
}
