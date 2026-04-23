import { HttpException } from '@bunito/server';

export class InternalServerErrorException extends HttpException {
  constructor() {
    super('INTERNAL_SERVER_ERROR');
  }
}
