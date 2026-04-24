import type { RawObject } from '@bunito/bunito';
import { App, Logger, LoggerModule, Module } from '@bunito/bunito';
import {
  Controller,
  Get,
  HttpModule,
  JSONMiddleware,
  JSONModule,
  NotFoundException,
  Params,
  UseMiddleware,
  UsePrefix,
} from '@bunito/http';
import { z } from 'zod';

// The first feature module exposes a small text API under /foo.

const FooParams = z.object({
  foo1: z.string().max(2),
});

@Controller({
  injects: [Logger],
  scope: 'singleton',
})
class FooController {
  constructor(private readonly logger: Logger) {
    logger.setContext(FooController);
    logger.debug('created');
  }

  @Get('/:foo1', {
    injects: [Params(FooParams)],
  })
  getFoo(params: Params<typeof FooParams>): Response {
    this.logger.debug('getFoo() called');

    return new Response(`foo1: ${params.foo1}`);
  }
}

@Module({
  controllers: [FooController],
})
// UsePrefix applies to every controller route declared by this module.
@UsePrefix('/foo')
class FooModule {}

// The second feature module exposes a JSON API under /bar.

const BarParams = z.object({
  bar1: z.string().max(2),
});

@Controller({
  injects: [Logger],
  scope: 'singleton',
})
class BarController {
  constructor(private readonly logger: Logger) {
    logger.setContext(BarController);
    logger.debug('created');
  }

  @Get('/:bar1', {
    injects: [Params(BarParams)],
  })
  getBar(params: Params<typeof BarParams>): RawObject {
    this.logger.debug('getBar() called');

    return {
      action: 'getBar',
      params,
    };
  }

  // Multiple route decorators can point to the same handler.
  @Get()
  @Get('/*')
  notFound(): never {
    throw new NotFoundException();
  }
}

@Module({
  imports: [JSONModule],
  controllers: [BarController],
})
@UsePrefix('/bar')
// Middleware applied at module level affects all controller routes below it.
@UseMiddleware(JSONMiddleware)
class BarModule {}

// The root app composes shared modules with feature modules.
@Module({
  imports: [LoggerModule, HttpModule, FooModule, BarModule],
})
class AppModule {}

await App.start(AppModule);
