import { Exception, isString } from '@bunito/common';
import { HTTP_ERROR_STATUS_CODES, HTTP_STATUS_MESSAGES } from './constants';
import type { HttpContentType, HttpErrorStatus } from './types';

export class HttpException<
  TData extends Record<string, unknown> = Record<string, unknown>,
> extends Exception {
  static capture(err: unknown): HttpException {
    if (HttpException.isInstance(err)) {
      return err;
    }

    return new HttpException('INTERNAL_SERVER_ERROR', undefined, err);
  }

  override name = 'HttpException';

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
  }

  get statusCode(): number {
    return HTTP_ERROR_STATUS_CODES[this.status];
  }

  toResponse(contentType?: HttpContentType): Response {
    switch (contentType) {
      case 'application/json':
        return new Response(JSON.stringify(this.toJSON()), {
          status: this.statusCode,
          headers: {
            'Content-Type': 'application/json',
          },
        });

      default:
        return new Response(this.message, {
          status: this.statusCode,
          headers: {
            'Content-Type': 'text/plain',
          },
        });
    }
  }

  toJSON(): Record<string, unknown> {
    const res: Record<string, unknown> = {};

    if (this.data) {
      res.data = this.data;
    } else {
      res.error = this.message;
    }

    return this.data
      ? {
          data: res,
        }
      : {
          error: this.message,
        };
  }
}
