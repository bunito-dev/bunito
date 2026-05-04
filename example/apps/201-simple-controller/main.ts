import { App, Logger, LoggerModule, Module, Provider } from '@bunito/bunito';
import { Controller, Get, HTTPModule, Params, Post, Query } from '@bunito/http';
import { z } from 'zod';

@Provider({
  injects: [Logger],
})
class FooProvider {
  constructor(private readonly logger: Logger) {
    logger.setContext(FooProvider);
    logger.debug('created');
  }

  foo(): string {
    this.logger.debug('foo() called');

    return 'bar';
  }
}

const BarParams = z.object({
  a: z.string().max(2),
  b: z.string(),
  c: z.string().toUpperCase(),
});

const BarQuery = z.object({
  bar: z.string().default('bar'),
  baz: z.string().default('baz'),
});

@Controller('/foo', {
  injects: [Logger, FooProvider],
})
class FooController {
  constructor(
    private readonly logger: Logger,
    private readonly fooProvider: FooProvider,
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

@Module({
  imports: [LoggerModule, HTTPModule],
  providers: [FooProvider],
  controllers: [FooController],
})
class AppModule {}

await App.start(AppModule);
