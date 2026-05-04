import { HTTPException } from '../http.exception';

export class NotFoundException extends HTTPException {
  constructor(message?: string) {
    super('NOT_FOUND', message);
  }
}
