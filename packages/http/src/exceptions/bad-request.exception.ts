import type { RawObject } from '@bunito/common';
import { HttpException } from '@bunito/server';

export class BadRequestException extends HttpException {
  constructor(message?: string, data?: RawObject) {
    super('BAD_REQUEST', message, data);
  }
}
