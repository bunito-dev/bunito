import { Controller, Logger, optional } from '@bunito/bunito';
import { Method, OnRequest, UseCORS } from '@bunito/http';

@Controller({
  injects: [optional(Logger)],
})
@UseCORS({
  methods: ['GET', 'POST'],
})
export class BarController {
  constructor(private readonly logger: Logger | null) {
    this.logger?.debug('created');
  }

  @OnRequest('/', {
    injects: [Method],
  })
  getBar(method: Method): Response {
    this.logger?.debug('getBar() called');

    return Response.json({
      bar: 'Hello bar!',
      method,
    });
  }
}
