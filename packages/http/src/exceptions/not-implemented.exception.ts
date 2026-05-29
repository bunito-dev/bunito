import { HTTPException } from '../http.exception';

export class NotImplementedException extends HTTPException {
  constructor(message?: string) {
    super('NOT_IMPLEMENTED', message);
  }
}
