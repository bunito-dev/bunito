import type { OnResponseContext } from '@bunito/http';
import { Controller, OnGet, OnResponse } from '@bunito/http';
import { FooService } from './foo.service';

// The controller injects a request-scoped service, so each request can observe a fresh instance.
@Controller({
  injects: [FooService],
})
export class FooController {
  constructor(private readonly fooService: FooService) {}

  /**
   * GET /foo
   */
  @OnGet()
  getIndex() {
    // Returning a plain object lets the shared response hook shape the final payload.
    return {
      controller: 'FooController',
      method: 'getIndex',
      message: this.fooService.hello(),
    };
  }

  /**
   * GET /foo/json
   */
  @OnGet('/json')
  getJSON() {
    // Returning Response skips the default serialization path and gives full HTTP control.
    return Response.json({
      controller: 'FooController',
      method: 'getJSON',
      message: this.fooService.hello(),
    });
  }

  @OnResponse()
  formatResponse(data: unknown, context: OnResponseContext) {
    const { logger } = context;

    // Response hooks can inspect or wrap data from every request handler in this controller.
    logger?.debug('Unprocessed response data:', data);

    return Response.json({
      foo: data,
    });
  }
}
