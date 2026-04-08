import type { Class, ClassDecorator } from '@bunito/common';
import type { ConfigService } from '../../config';
import { LoggerService } from '../logger.service';
import type { FormatLogOptions } from '../types';

export interface LogFormatter {
  configure?(configService: ConfigService): void;

  formatLog(options: FormatLogOptions): string;
}

export function LogFormatter<TFormatter extends Class<LogFormatter>>(
  name: string,
): ClassDecorator<TFormatter> {
  return (target) => {
    LoggerService.registerFormatter(name.toLowerCase(), target);
    return target;
  };
}
