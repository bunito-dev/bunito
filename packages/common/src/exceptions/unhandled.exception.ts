import { Exception } from './exception';

export class UnhandledException extends Exception {
  constructor(message?: string, cause?: unknown) {
    super(message ?? 'Unhandled Exception', undefined, cause);

    this.name = 'UnhandledException';
  }
}
