import type { RawObject } from '@bunito/common';
import { BadRequestException } from './bad-request.exception';

export class ValidationFailedException extends BadRequestException {
  constructor(data?: RawObject) {
    super('Validation Failed', data);
  }
}
