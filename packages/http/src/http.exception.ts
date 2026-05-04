import type { RawObject } from '@bunito/common';
import { Exception, isNumber } from '@bunito/common';
import { HTTP_ERROR_STATUS_CODES, HTTP_ERROR_STATUS_TEXT } from './constants';
import type { HTTPContentType, HTTPErrorStatus } from './types';

export class HTTPException extends Exception {
  readonly statusCode: number;

  private readonly data: RawObject | undefined;

  constructor(
    statusLike: HTTPErrorStatus | number,
    message?: string,
    data?: RawObject,
    cause?: unknown,
  ) {
    let statusCode: number;
    let statusText: string;

    if (isNumber(statusLike)) {
      statusCode = statusLike;
      statusText = message ?? 'Unknown Error';
    } else {
      statusCode = HTTP_ERROR_STATUS_CODES[statusLike];
      statusText = message ?? HTTP_ERROR_STATUS_TEXT[statusLike];
    }

    super(statusText, cause);

    this.name = 'HTTPException';
    this.statusCode = statusCode;
    this.data = data;
  }

  toJSON(): RawObject {
    return this.data
      ? this.data
      : {
          error: this.message,
        };
  }

  toResponse(contentType?: HTTPContentType): Response {
    switch (contentType) {
      case 'text/plain':
        return new Response(this.message, { status: this.statusCode });

      default:
        return Response.json(this.toJSON(), { status: this.statusCode });
    }
  }
}
