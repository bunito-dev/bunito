import type { RawObject } from '@bunito/common';
import { Exception, isNumber } from '@bunito/common';
import {
  HTTP_ERROR_STATUS_CODES,
  HTTP_ERROR_STATUS_MAP,
  HTTP_ERROR_STATUS_MESSAGES,
} from '../constants';
import type { HttpErrorStatus } from '../types';

export class HttpException extends Exception {
  override name = 'HttpException';

  readonly status: number;

  readonly data: RawObject | undefined;

  constructor(status: HttpErrorStatus | number, message?: string, data?: RawObject) {
    let error = message;
    let statusName: HttpErrorStatus | undefined;
    let statusCode: number;

    if (isNumber(status)) {
      statusCode = status;
      statusName = HTTP_ERROR_STATUS_MAP.get(statusCode);
    } else {
      statusCode = HTTP_ERROR_STATUS_CODES[status];
      statusName = status;
    }

    if (!error && statusName) {
      error = HTTP_ERROR_STATUS_MESSAGES[statusName];
    }

    super(error ?? 'Unexpected Error');

    this.status = statusCode;
    this.data = data;
  }

  toResponse(): Response {
    return new Response(this.message, {
      status: this.status,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
