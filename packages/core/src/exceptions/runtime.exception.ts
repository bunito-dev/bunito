import { InternalException } from './internal.exception';

export class RuntimeException extends InternalException {
  override name = 'RuntimeException';
}
