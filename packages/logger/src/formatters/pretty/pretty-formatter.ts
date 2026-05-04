import type { InspectColor } from 'node:util';
import { styleText } from 'node:util';
import { isString } from '@bunito/common';
import type { ResolveConfig } from '@bunito/config';
import { LogFormatter } from '../log-formatter';
import type { FormatLogOptions } from '../types';
import { PRETTY_LEVEL_THEMES } from './constants';
import { PrettyFormatterConfig } from './pretty-formatter.config';
import { formatDuration, formatTimestamp } from './utils';

@LogFormatter({
  injects: [PrettyFormatterConfig],
})
export class PrettyFormatter implements LogFormatter {
  readonly logFormat = 'pretty';

  constructor(private readonly config: ResolveConfig<typeof PrettyFormatterConfig>) {}

  formatLog(options: FormatLogOptions): string {
    const { timestamp, context, level, message, data, error, traceId, duration } =
      options;

    const prefix = `${this.styleText(formatTimestamp(timestamp), 'gray')} `;

    const buffer: string[] = [];

    const levelTheme = PRETTY_LEVEL_THEMES[level.name];

    buffer.push(
      prefix,
      this.styleText(levelTheme.icon, levelTheme.primary),
      ' ',
      this.styleText(level.name, levelTheme.primary),
    );

    if (context) {
      buffer.push(' ', this.styleText(`[${context}]`, levelTheme.secondary, 'bold'));
    }

    if (traceId) {
      buffer.push(' ', this.styleText(`#${traceId}`, 'gray', 'bold'));
    }

    if (message) {
      buffer.push(' ', this.styleText(message, levelTheme.text));
    }

    if (duration !== undefined) {
      buffer.push(' ', this.styleText(formatDuration(duration), 'gray', 'bold'));
    }

    if (error) {
      buffer.push(...this.inspect(error).map((line) => `\n${prefix}  ${line}`));
    }

    if (data?.length) {
      for (const item of data) {
        const lines: string[] = [];

        if (isString(item, false)) {
          lines.push(item);
        } else if (Array.isArray(item)) {
          for (const [index, value] of item.entries()) {
            lines.push(
              ...this.inspect(value).map(
                (line) => `${this.styleText(`[${index}]`, 'gray', 'italic')} ${line}`,
              ),
            );
          }
        } else {
          lines.push(...this.inspect(item));
        }

        for (const line of lines) {
          buffer.push('\n', prefix, this.styleText(`∙`, levelTheme.primary), ` `, line);
        }
      }
    }

    return buffer.join('');
  }

  private inspect(value: unknown): string[] {
    return Bun.inspect(value, {
      colors: !this.config.disableColor,
      depth: this.config.inspectDepth,
    })
      .split('\n')
      .filter(Boolean);
  }

  private styleText(text: string, ...colors: InspectColor[]): string {
    if (this.config.disableColor || !colors.length) {
      return text;
    }

    return styleText(colors, text);
  }
}
