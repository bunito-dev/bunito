import { Controller, Logger } from '@bunito/bunito';
import { Get, Params, Post, Query } from '@bunito/http';
import { FooService } from './foo-service';
import { BarParams, BarQuery } from './schemas';

@Controller('/foo', {
  injects: [Logger, FooService],
})
export class FooController {
  constructor(
    private readonly logger: Logger,
    private readonly fooProvider: FooService,
  ) {
    logger.setContext(FooController);
    logger.debug('created');
  }

  @Get()
  getFoo(): Response {
    this.logger.debug('getFoo() called');

    return Response.json({
      foo: this.fooProvider.foo(),
    });
  }

  @Get('/bar/:a/:b', {
    injects: [Params(), Query()],
  })
  getBarWithParams(params: Params<{ a: string; b: string }>, query: Query): Response {
    this.logger.debug('getBarWithParams() called');

    return Response.json({
      foo: this.fooProvider.foo(),
      query,
      params,
    });
  }

  @Get('/bar/:a/:b/:c', {
    injects: [Query(BarQuery), Params(BarParams)],
  })
  getBarWithValidation(
    query: Query<typeof BarQuery>,
    params: Params<typeof BarParams>,
  ): Response {
    // Zod schemas transform and validate injected route data before the handler runs.
    this.logger.debug('getBarWithValidation() called');

    return Response.json({
      foo: this.fooProvider.foo(),
      query,
      params,
    });
  }

  @Post('/bar')
  postBar(): Response {
    this.logger.debug('postBar() called');

    return Response.json({
      foo: this.fooProvider.foo(),
    });
  }
}
