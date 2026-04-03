import { Exception, isString } from '@bunito/common';
import { HTTP_ERROR_STATUS_CODES, HTTP_STATUS_MESSAGES } from './constants';
import type { HttpErrorStatus } from './types';

export class HttpException<
  TData extends Record<string, unknown> = Record<string, unknown>,
> extends Exception {
  static capture(err: unknown): HttpException {
    if (HttpException.isInstance(err)) {
      return err;
    }

    return new HttpException('internalServerError', undefined, err);
  }

  constructor(
    readonly status: HttpErrorStatus,
    messageLike?: TData | string,
    cause?: unknown,
  ) {
    let message: string | undefined;
    let data: TData | undefined;

    if (isString(messageLike)) {
      message = messageLike;
    } else {
      message = HTTP_STATUS_MESSAGES[status];
      data = messageLike;
    }

    super(message, data, cause);
  }

  toResponse(): Response {
    const responseData: Record<string, unknown> = {};

    if (this.data) {
      responseData.data = this.data;
    } else {
      responseData.error = this.message;
    }

    const a = new Response();

    a.headers.set('Content-Type', 'application/json');

    return Response.json(responseData, {
      status: HTTP_ERROR_STATUS_CODES[this.status],
    });
  }
}
