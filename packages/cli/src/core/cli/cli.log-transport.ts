import type { InspectColor } from 'node:util';
import { styleText } from 'node:util';
import { inspectName } from '@bunito/common';
import type { LogRecord } from '@bunito/logger';
import { LogTransport } from '@bunito/logger';
import { PREFIX_COLOR } from './constants';

@LogTransport()
export class CLILogTransport implements LogTransport {
  private static readonly prefixColors = new Map<string, InspectColor>();

  readonly NAME = 'cli';

  write(options: LogRecord): void {
    const { message, data } = options;
    let { prefix = '' } = options;

    let lines: string[] = [];

    if (prefix) {
      const { prefixColors } = CLILogTransport;

      let color = prefixColors.get(prefix);

      if (!color) {
        color = PREFIX_COLOR[prefixColors.size % PREFIX_COLOR.length] ?? 'gray';

        CLILogTransport.prefixColors.set(prefix, color);
      }

      prefix = styleText(color, prefix);
    }

    if (message) {
      lines.push(...message.split('\n'));
    }

    if (data) {
      lines.push(...data.map((item) => inspectName(item)));
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
