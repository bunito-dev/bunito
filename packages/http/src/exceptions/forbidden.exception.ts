import { HttpException } from '@bunito/server';

export class ForbiddenException extends HttpException {
  constructor(message?: string) {
    super('FORBIDDEN', message);
  }
}
