import type { OnRequestContext } from '@bunito/http';
import { Controller, OnGet } from '@bunito/http';
import { BarService } from './bar.service';
import { GetDelayedSchema } from './schemas';

// Declaring `/bar` here composes with FooModule's `/foo` prefix into `/foo/bar`.
@Controller('/bar', {
  injects: [BarService],
})
export class BarController {
  constructor(private readonly barService: BarService) {}

  /**
   * GET /foo/bar
   */
  @OnGet()
  async getIndex() {
    return {
      controller: 'BarController',
      method: 'getIndex',
      message: this.barService.hello(),
    };
  }

  /**
   * GET /foo/bar/<param 1>
   */
  @OnGet('/:delay/', GetDelayedSchema)
  async getDelayed(context: OnRequestContext<typeof GetDelayedSchema>) {
    // The schema coerces and validates the route param before the handler sees it.
    const { delay } = context.params;

    return {
      controller: 'BarController',
      method: 'getDelayed',
      params: {
        delay,
      },
      message: await this.barService.delayedHello(delay),
    };
  }

  /**
   * GET /foo/bar/<param 1>/<param 2>
   */
  @OnGet('/:delay/:additional')
  getParams(
    context: OnRequestContext<{
      params: { delay: string; additional: string };
    }>,
  ) {
    // Without an explicit schema, route params stay as strings and query params are passed through.
    const { params, query } = context;

    return {
      controller: 'BarController',
      method: 'getParams',
      params,
      query,
    };
  }

  /**
   * GET /a/bar/a/<any path>
   */
  @OnGet('/a/**')
  getSuperWildcard(context: OnRequestContext) {
    // `**` matches the rest of the path, which is useful for catch-all style routes.
    const { query } = context;

    return {
      controller: 'BarController',
      method: 'getSuperWildcard',
      query,
    };
  }

  /**
   * GET /a/bar/a/<any param>/b
   */
  @OnGet('/a/*/b')
  getMiddleWildcard(context: OnRequestContext) {
    // `*` matches a single dynamic segment in the middle of a route.
    const { query } = context;

    return {
      controller: 'BarController',
      method: 'getMiddleWildcard',
      query,
    };
  }
}
