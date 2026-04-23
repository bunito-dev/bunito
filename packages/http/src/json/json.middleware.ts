import { isObject } from '@bunito/common';
import type { HttpException, RequestContext } from '@bunito/server';
import { BadRequestException, NotImplementedException } from '../exceptions';
import { Middleware } from '../middleware';
import { JSON_CONTENT_TYPE } from './constants';
import type { JSONMiddlewareOptions } from './types';

@Middleware()
export class JSONMiddleware implements Middleware<JSONMiddlewareOptions> {
  async beforeRequest(
    context: RequestContext,
    options?: JSONMiddlewareOptions,
  ): Promise<void> {
    if (options?.disableBodyParser) {
      return;
    }

    const contentType = context.headers.get('Content-Type');

    if (contentType && contentType !== JSON_CONTENT_TYPE) {
      return;
    }

    if (context.request.body) {
      try {
        context.body = await context.request.json();
      } catch {
        throw new BadRequestException('Invalid JSON Body');
      }
    }
  }

  serializeResponseData(data: unknown, context: RequestContext): Response {
    try {
      return Response.json(data);
    } catch (err) {
      context.logger?.warn('Invalid JSON Response', err);

      throw new NotImplementedException('Invalid JSON Response');
    }
  }

  serializeException(exception: HttpException): Response {
    const { message: error, data, status } = exception;

    return Response.json(isObject(data) ? data : { error }, {
      status,
    });
  }
}
