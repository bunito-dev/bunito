import { BadRequestException } from '../../exceptions';
import type { HTTPException } from '../../http.exception';
import { Middleware } from '../middleware';
import type { MiddlewareContext } from '../types';
import type { JSONMiddlewareOptions } from './types';

@Middleware<JSONMiddlewareOptions>()
export class JSONMiddleware implements Middleware<JSONMiddlewareOptions> {
  async beforeRequest(context: MiddlewareContext<JSONMiddlewareOptions>): Promise<void> {
    const { request, disableBodyParser, replaceBody } = context;

    if (disableBodyParser) {
      return;
    }

    if (request.body && (context.body === null || replaceBody)) {
      try {
        context.body = await request.json();
      } catch {
        throw new BadRequestException('Invalid JSON body');
      }
    }
  }

  serializeResponseData(responseData: unknown): Response {
    return Response.json(responseData);
  }

  serializeException(exception: HTTPException): Response {
    return exception.toResponse('application/json');
  }
}
