import type { ExceptionOptions } from '@bunito/common';
import { Exception } from '@bunito/common';
import { HTTP_STATUS_MESSAGES } from './constants';
import type { HttpStatus } from './types';

export class HttpException<
  TData extends Record<string, unknown> = Record<string, unknown>,
> extends Exception<TData> {
  static capture(err: unknown): HttpException {
    if (HttpException.isInstance(err)) {
      return err;
    }

    return new HttpException(500, undefined, err);
  }

  constructor(
    readonly status: HttpStatus,
    messageOrData?: TData | string,
    cause?: unknown,
  ) {
    const options: ExceptionOptions<TData> = {
      cause,
    };

    if (typeof messageOrData === 'string') {
      options.message = messageOrData;
    } else {
      options.message = HTTP_STATUS_MESSAGES[status as HttpStatus];
      options.data = messageOrData;
    }

    super(options);
  }

  toResponse(): Response {
    const responseData: Record<string, unknown> = {};

    if (this.data) {
      responseData.data = this.data;
    } else {
      responseData.error = this.message;
    }

    return Response.json(
      this.data
        ? {
            ...this.data,
          }
        : {
            error: this.message,
          },
      {
        status: this.status,
      },
    );
  }
}
