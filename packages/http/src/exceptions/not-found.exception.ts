import { HttpException } from '@bunito/server';

export class NotFoundException extends HttpException {
  constructor(message?: string) {
    super('NOT_FOUND', message);
  }
}
