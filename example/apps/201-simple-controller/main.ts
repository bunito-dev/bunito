import { App, Logger, LoggerModule, Module, Provider } from '@bunito/bunito';
import { Controller, Get, HttpModule, Params, Post, Query } from '@bunito/http';
import { z } from 'zod';

// Providers can be injected into controllers just like into other providers.
@Provider({
  injects: [Logger],
})
class FooProvider {
  constructor(private readonly logger: Logger) {
    this.logger.setContext(FooProvider);

    logger.debug('created');
  }

  foo(): string {
    this.logger.debug('foo() called');

    return 'bar';
  }
}

// Zod schemas can be attached to route injections for validation and coercion.
const BarParams = z.object({
  a: z.string().max(2),
  b: z.string(),
  c: z.string().toUpperCase(),
});

const BarQuery = z.object({
  bar: z.string().default('bar'),
  baz: z.string().default('baz'),
});

// Controller prefix and provider options live on the controller decorator.
@Controller('/foo', {
  injects: [Logger, FooProvider],
})
class FooController {
  constructor(
    private readonly logger: Logger,
    private readonly fooProvider: FooProvider,
  ) {
    logger.debug('created');
  }

  // GET /foo
  @Get()
  getFoo(): Response {
    this.logger.debug('getFoo() called');

    return Response.json({
      foo: this.fooProvider.foo(),
    });
  }

  // GET /foo/bar/:a/:b with unvalidated params and query object.
  @Get('/bar/:a/:b', {
    injects: [Params, Query],
  })
  getBarWithParams(
    params: Params<{
      a: string;
      b: string;
    }>,
    query: Query,
  ): Response {
    this.logger.debug('getBarWithParams() called');

    return Response.json({
      foo: this.fooProvider.foo(),
      query,
      params,
    });
  }

  // GET /foo/bar/:a/:b/:c with schema-backed query and params.
  @Get('/bar/:a/:b/:c', {
    injects: [Query(BarQuery), Params(BarParams)],
  })
  getBarWithValidation(
    query: Query<typeof BarQuery>,
    params: Params<typeof BarParams>,
  ): Response {
    this.logger.debug('getBarWithParams() called');

    return Response.json({
      foo: this.fooProvider.foo(),
      query,
      params,
    });
  }

  // POST /foo/bar
  @Post('/bar')
  postBar(): Response {
    this.logger.debug('postBar() called');

    return Response.json({
      foo: this.fooProvider.foo(),
    });
  }
}

// HttpModule registers the HTTP runtime; controllers are provided by the app module.
@Module({
  imports: [LoggerModule, HttpModule],
  providers: [FooProvider],
  controllers: [FooController],
})
class AppModule {}

await App.start(AppModule);
