import { Controller, Logger, optional } from '@bunito/bunito';
import { Get, Method, OnRequest, UseCORS } from '@bunito/http';

@Controller({
  injects: [optional(Logger)],
})
@UseCORS({
  methods: ['GET'],
})
export class FooController {
  constructor(private readonly logger: Logger | null) {
    logger?.debug('created');
  }

  @Get()
  getFoo(): Response {
    this.logger?.debug('getFoo() called');

    return Response.json({
      foo: 'Hello foo!',
    });
  }

  @OnRequest('/bar', {
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
