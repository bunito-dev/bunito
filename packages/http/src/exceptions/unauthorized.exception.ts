import { HttpException } from '@bunito/server';

export class UnauthorizedException extends HttpException {
  constructor(message?: string) {
    super('UNAUTHORIZED', message);
  }
}
