import * as process from 'node:process';
import { styleText } from 'node:util';
import { parseBoolean } from './parse-boolean';

export function warn(msg: string, ...lines: string[]) {
  const hideWarnings = parseBoolean(process.env.HIDE_WARNINGS);

  if (process.env.NODE_ENV === 'test') {
    if (hideWarnings !== false) {
      return;
    }
  } else {
    if (hideWarnings) {
      return;
    }
  }

  const buffer = [
    styleText(['yellowBright', 'bold'], 'WARNING '), //
    styleText('yellow', msg),
    '\n',
  ];

  for (const line of lines) {
    buffer.push(styleText('yellow', '» '), styleText(['gray', 'italic'], line), '\n');
  }

  console.write(buffer.join(''));
}
