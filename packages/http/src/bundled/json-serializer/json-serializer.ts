import type { HTTPException } from '../../http-exception';
import { Middleware } from '../../middleware';

@Middleware()
export class JSONSerializer implements Middleware {
  serializeResponseData(responseData: unknown): Response {
    return Response.json(responseData);
  }

  serializeException(exception: HTTPException): Response {
    return exception.toResponse('application/json');
  }
}
