import { HTTPException } from '../http.exception';

export class UnauthorizedException extends HTTPException {
  constructor(message?: string) {
    super('UNAUTHORIZED', message);
  }
}
