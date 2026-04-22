import { InternalException } from './internal.exception';

export class ConfigurationException extends InternalException {
  override name = 'ConfigurationException';
}
