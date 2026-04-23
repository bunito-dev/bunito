import { HttpException } from '@bunito/server';

export class NotImplementedException extends HttpException {
  constructor(message?: string) {
    super('NOT_IMPLEMENTED', message);
  }
}
