import type { InspectColor } from 'node:util';
import { styleText } from 'node:util';
import { isString } from '@bunito/common';
import type { LogRecord } from '@bunito/logger';
import { LogTransport } from '@bunito/logger';
import { CLIException } from './cli.exception';
import { PREFIX_COLOR } from './constants';

@LogTransport()
export class CLILogTransport implements LogTransport {
  private static readonly prefixColors = new Map<string, InspectColor>();

  readonly NAME = 'cli';

  write(options: LogRecord): void {
    const { level, message, data, error } = options;

    switch (level.kind) {
      case 'OK':
        return;

      default:
    }

    let { prefix = '' } = options;

    let lines: string[] = [];

    if (prefix) {
      const { prefixColors } = CLILogTransport;

      let prefixColor = prefixColors.get(prefix);

      if (!prefixColor) {
        prefixColor = PREFIX_COLOR[prefixColors.size % PREFIX_COLOR.length] ?? 'gray';
        CLILogTransport.prefixColors.set(prefix, prefixColor);
      }

      prefix = styleText(prefixColor, prefix);
    }

    let instructions: string[] | undefined;

    if (error) {
      if (CLIException.isInstance(error)) {
        lines.push(styleText('red', error.message));
        ({ instructions } = error);
      } else {
        lines.push(
          ...Bun.inspect(error, {
            colors: true,
          })
            .trim()
            .split('\n')
            .map((line) => `${styleText('redBright', '•')} ${line}`),
        );
      }
    } else if (message) {
      lines.push(message);
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
        ...instructions.map((instruction) => styleText(['white', 'italic'], instruction)),
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
