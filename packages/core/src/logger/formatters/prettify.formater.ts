import type { InspectColor } from 'node:util';
import { inspect, styleText } from 'node:util';
import type { LogFormatter, LogLevel } from '../types';

const LOG_LEVEL_THEMES: Record<
  LogLevel,
  {
    icon: string;
    colorPrimary: InspectColor;
    colorSecondary: InspectColor;
  }
> = {
  fatal: { icon: '☠', colorPrimary: 'redBright', colorSecondary: 'redBright' },
  error: { icon: '✘', colorPrimary: 'red', colorSecondary: 'red' },
  warn: { icon: '➥', colorPrimary: 'yellow', colorSecondary: 'yellowBright' },
  info: { icon: '➥', colorPrimary: 'blue', colorSecondary: 'blueBright' },
  ok: { icon: '✔', colorPrimary: 'green', colorSecondary: 'greenBright' },
  trace: { icon: '➥', colorPrimary: 'magenta', colorSecondary: 'magentaBright' },
  debug: { icon: '➥', colorPrimary: 'cyan', colorSecondary: 'cyanBright' },
  verbose: { icon: '➥', colorPrimary: 'gray', colorSecondary: 'gray' },
};

function renderLevel(level: LogLevel): string {
  return `${level.toUpperCase()}`.padStart(7);
}

export const prettifyFormatter: LogFormatter = (
  stdout,
  context,
  level,
  message,
  args,
): void => {
  const buffer: Array<string> = [];

  const write = (text: string, ...colors: Array<InspectColor>): void => {
    buffer.push(colors.length ? styleText(colors, text) : text);
  };

  const theme = LOG_LEVEL_THEMES[level];

  write(theme.icon, theme.colorSecondary);
  write(' ');

  write(new Date().toISOString(), 'gray');
  write(' ');
  write(renderLevel(level), theme.colorPrimary);
  write(' ');

  if (context) {
    write(`[${context}]`, theme.colorSecondary, 'bold');
    write(' ');
  }

  const data: Array<unknown> = [...args];

  if (typeof message === 'string') {
    write(message, theme.colorSecondary);
  } else if (Error.isError(message)) {
    write(message.message, theme.colorSecondary);
  } else if (message !== undefined) {
    data.unshift(message);
  }

  write('\n');

  if (Error.isError(message)) {
    write(inspect(message));
    write('\n');
  }

  if (data.length > 0) {
    for (const item of data) {
      write(`∙`, theme.colorSecondary);
      write(' ');
      write(inspect(item, true, 10, true));
      write('\n');
    }
  }

  stdout.write(buffer.join(''));
};
