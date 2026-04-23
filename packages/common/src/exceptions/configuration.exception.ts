import { InternalException } from './internal.exception';

export class ConfigurationException extends InternalException {
  constructor(message?: string, cause?: unknown) {
    super(message, cause);

    this.name = 'ConfigurationException';
  }
}
