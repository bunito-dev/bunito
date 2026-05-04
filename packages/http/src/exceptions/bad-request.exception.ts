import type { RawObject } from '@bunito/common';
import { HTTPException } from '../http.exception';

export class BadRequestException extends HTTPException {
  constructor(message?: string, data?: RawObject) {
    super('BAD_REQUEST', message, data);
  }
}
