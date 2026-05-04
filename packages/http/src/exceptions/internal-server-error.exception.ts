import { HTTPException } from '../http.exception';

export class InternalServerErrorException extends HTTPException {
  static capture(error: unknown): HTTPException {
    if (HTTPException.isInstance(error)) {
      return error;
    }

    return new InternalServerErrorException(error);
  }

  constructor(cause?: unknown) {
    super('INTERNAL_SERVER_ERROR', undefined, undefined, cause);
  }
}
