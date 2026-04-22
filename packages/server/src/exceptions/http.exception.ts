import { Exception, isObject } from '@bunito/common';
import { HTTP_ERROR_STATUS_CODES, HTTP_ERROR_STATUS_MESSAGES } from '../constants';
import type { HttpErrorStatus } from '../types';

export class HttpException<
  TData extends Record<string, unknown> = Record<string, unknown>,
> extends Exception<TData> {
  override name = 'HttpException';

  constructor(
    readonly status: HttpErrorStatus,
    message?: string,
    data?: Partial<TData>,
    cause?: unknown,
  ) {
    super(message ?? HTTP_ERROR_STATUS_MESSAGES[status], data, cause);
  }

  get statusCode(): number {
    return HTTP_ERROR_STATUS_CODES[this.status];
  }

  toJSON(): Record<string, unknown> {
    return isObject(this.data)
      ? this.data
      : {
          error: this.message,
          data: this.data,
        };
  }

  toResponse(contentType?: 'application/json' | 'text/plain'): Response {
    const status = this.statusCode;

    switch (contentType) {
      case 'application/json':
        return Response.json(this.toJSON(), {
          status,
        });

      default:
        return new Response(this.message, {
          status,
          headers: { 'Content-Type': 'text/plain' },
        });
    }
  }
}
