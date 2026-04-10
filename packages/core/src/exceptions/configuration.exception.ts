import { InternalException } from './internal.exception';

export class ConfigurationException extends InternalException {
  constructor(
    message?: string | undefined,
    data?: Record<string, unknown>,
    cause?: unknown,
  ) {
    super(message, data, cause);

    this.name = 'ConfigurationException';
  }
}
