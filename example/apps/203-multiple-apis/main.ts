import type { RawObject } from '@bunito/bunito';
import { App, Logger, LoggerModule, Module } from '@bunito/bunito';
import {
  Controller,
  Get,
  HTTPModule,
  JSONMiddleware,
  JSONModule,
  NotFoundException,
  Params,
  UseMiddleware,
  UsePrefix,
} from '@bunito/http';
import { z } from 'zod';

const FooParams = z.object({
  foo: z.string().max(2),
});

@Controller('/', {
  injects: [Logger],
  scope: 'singleton',
})
class FooController {
  constructor(private readonly logger: Logger) {
    logger.setContext(FooController);
    logger.debug('created');
  }

  @Get('/:foo', {
    injects: [Params(FooParams)],
  })
  getFoo(params: Params<typeof FooParams>): Response {
    this.logger.debug('getFoo() called');

    return new Response(`foo: ${params.foo}`);
  }
}

@Module({
  controllers: [FooController],
})
@UsePrefix('/foo')
class FooModule {}

const BarParams = z.object({
  bar: z.string().max(2),
});

@Controller('/', {
  injects: [Logger],
  scope: 'singleton',
})
class BarController {
  constructor(private readonly logger: Logger) {
    logger.setContext(BarController);
    logger.debug('created');
  }

  @Get('/:bar', {
    injects: [Params(BarParams)],
  })
  getBar(params: Params<typeof BarParams>): RawObject {
    this.logger.debug('getBar() called');

    return {
      action: 'getBar',
      params,
    };
  }

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
@UseMiddleware(JSONMiddleware)
class BarModule {}

@Module({
  imports: [LoggerModule, HTTPModule, FooModule, BarModule],
})
class AppModule {}

await App.start(AppModule);
