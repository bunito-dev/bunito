import process from 'node:process';
import type { InspectColor } from 'node:util';
import { styleText } from 'node:util';
import { Exception } from '#common';

export class LoggerService {
  // biome-ignore lint/complexity/noUselessConstructor: Bun coverage counts generated constructors as uncovered.
  constructor() {}

  info(...args: unknown[]): this {
    return this.print('info', ...args);
  }

  warn(...args: unknown[]): this {
    return this.print('warn', ...args);
  }

  error(...args: unknown[]): this {
    return this.print('error', ...args);
  }

  br(): void {
    process.stdout.write('\n');
  }

  private print(level: 'info' | 'warn' | 'error', ...args: unknown[]): this {
    let icon: string;
    let primary: InspectColor | InspectColor[];
    let secondary: InspectColor | InspectColor[];

    switch (level) {
      case 'info':
        icon = '∙';
        primary = 'cyanBright';
        secondary = ['cyan', 'italic'];
        break;

      case 'warn':
        icon = '⚠';
        primary = 'yellowBright';
        secondary = ['yellow', 'italic'];
        break;

      case 'error':
        icon = '✘';
        primary = 'redBright';
        secondary = ['red', 'italic'];
        break;
    }

    const lines: string[] = [];

    for (const arg of args) {
      if (arg instanceof Exception) {
        lines.push(arg.message, ...arg.args);
      } else if (Error.isError(arg)) {
        lines.push(arg.message);
      } else {
        lines.push(String(arg));
      }
    }

    const buffer: string[] = [];

    for (const [index, line] of lines.entries()) {
      buffer.push(styleText(primary, index === 0 ? icon : '➥'));
      buffer.push(' ');
      buffer.push(styleText(index === 0 ? primary : secondary, line));
      buffer.push('\n');
    }

    process.stdout.write(buffer.join(''));

    return this;
  }
}
