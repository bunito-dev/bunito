import { Exception } from './exception';

export class UnhandledException extends Exception {
  override message = 'Unhandled Exception';

  override name = 'UnhandledException';

  constructor(message?: string, cause?: unknown) {
    super(message, undefined, cause);
  }
}
