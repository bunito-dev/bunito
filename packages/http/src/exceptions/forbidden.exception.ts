import { HTTPException } from '../http.exception';

export class ForbiddenException extends HTTPException {
  constructor(message?: string) {
    super('FORBIDDEN', message);
  }
}
