import { Exception, isObject, isString } from '@bunito/common';
import { HTTP_ERROR_STATUS_CODES, HTTP_STATUS_MESSAGES } from '../constants';
import type { HttpErrorStatus } from '../types';

export class HttpException<
  TData extends Record<string, unknown> = Record<string, unknown>,
> extends Exception {
  static override capture(err: unknown): HttpException {
    if (HttpException.isInstance(err)) {
      return err;
    }

    return new HttpException('INTERNAL_SERVER_ERROR', undefined, err);
  }

  constructor(
    readonly status: HttpErrorStatus,
    optionsLike?: Partial<{ message: string; data: TData }> | string,
    cause?: unknown,
  ) {
    let message: string | undefined;
    let data: TData | undefined;

    if (isString(optionsLike)) {
      message = optionsLike;
    } else if (optionsLike) {
      ({ message, data } = optionsLike);
    }

    if (!message) {
      message = HTTP_STATUS_MESSAGES[status];
    }

    super(message, data, cause);

    this.name = 'HttpException';
  }

  get statusCode(): number {
    return HTTP_ERROR_STATUS_CODES[this.status];
  }

  toJSON() {
    return isObject(this.data)
      ? this.data
      : {
          error: this.message,
          data: this.data,
        };
  }
}
