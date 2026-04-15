import type { FormatLogOptions } from './types';

export interface FormatterExtension {
  formatLog(options: FormatLogOptions): string;
}
