import { inspect } from 'node:util';
import { LOG_LEVELS } from '../constants';
import type { LogFormatter } from '../types';

function serializeError(error: Error): Record<string, unknown> {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    cause: error.cause,
  };
}

export const jsonFormatter: LogFormatter = (
  stdout,
  context,
  level,
  message,
  args,
): void => {
  const record: Record<string, unknown> = {
    timestamp: new Date(),
    type: level,
    level: LOG_LEVELS[level],
    context,
  };

  let data: Array<unknown>;

  if (Error.isError(message)) {
    record.error = serializeError(message);
    data = args;
  } else if (typeof message === 'string') {
    record.message = message;
    data = args;
  } else {
    data = [message, ...args];
  }

  stdout.write(
    `${JSON.stringify({
      ...record,
      data: data.length ? data.map((item) => inspect(item)) : undefined,
    })}\n`,
  );
};
