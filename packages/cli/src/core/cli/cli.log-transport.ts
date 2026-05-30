import type { InspectColor } from 'node:util';
import { styleText } from 'node:util';
import { isString } from '@bunito/common';
import type { LogRecord } from '@bunito/logger';
import { LogTransport } from '@bunito/logger';
import { CLIException } from './cli.exception';
import { PREFIX_COLOR } from './constants';

@LogTransport()
export class CLILogTransport implements LogTransport {
  private readonly prefixColors = new Map<string, InspectColor>();

  readonly NAME = 'cli';

  write(options: LogRecord): void {
    const { level, message, data, error } = options;

    let { prefix = '' } = options;

    let lines: string[] = [];

    let icon = '';
    let messageColor: InspectColor | undefined;

    switch (level.kind) {
      case 'OK':
        icon = styleText('greenBright', '✓ ');
        break;

      case 'WARN':
      case 'ERROR':
      case 'FATAL':
        icon = styleText('redBright', '⦸ ');
        messageColor = 'red';
        break;

      default:
    }

    if (prefix) {
      let prefixColor = this.prefixColors.get(prefix);

      if (!prefixColor) {
        prefixColor =
          PREFIX_COLOR[this.prefixColors.size % PREFIX_COLOR.length] ?? 'gray';
        this.prefixColors.set(prefix, prefixColor);
      }

      prefix = styleText(prefixColor, prefix);
    }

    let instructions: string[] | undefined;

    if (error && !CLIException.isInstance(error)) {
      lines.push(
        ...Bun.inspect(error, {
          colors: true,
        })
          .trim()
          .split('\n')
          .map((line) => `${icon}${line}`),
      );
    } else {
      if (CLIException.isInstance(error)) {
        ({ instructions } = error);
      }

      if (message) {
        lines.push(`${icon}${messageColor ? styleText(messageColor, message) : message}`);
      }
    }

    if (data && Array.isArray(data[0])) {
      for (const instruction of data[0]) {
        if (!isString(instruction)) {
          continue;
        }

        instructions ??= [];
        instructions.push(instruction);
      }
    }

    if (instructions) {
      lines.push(
        ...instructions.map(
          (instruction) => `↪ ${styleText(['white', 'italic'], instruction)}`,
        ),
      );
    }

    if (prefix) {
      lines = lines.map((line) => `${prefix} ${line}`);
    }

    const buffer = lines.join('\n').trim();

    if (buffer.endsWith('\n')) {
      console.write(buffer);
    } else {
      console.write(buffer, '\n');
    }
  }
}
