import type { RawObject } from '@bunito/bunito';
import { App, Logger, LoggerModule, Module } from '@bunito/bunito';
import {
  Body,
  Controller,
  Get,
  HttpModule,
  JSONMiddleware,
  JSONModule,
  Params,
  Post,
  UseMiddleware,
} from '@bunito/http';
import { z } from 'zod';

// Route params and JSON bodies can each have their own schema.
const FooParams = z.object({
  bar: z.string().max(2),
});

const FooBody = z.object({
  foo: z.string().default("I'm a foo"),
  bar: z.string().default("I'm a bar"),
});

// JSONMiddleware parses requests and serializes plain object responses.
@Controller('/foo', {
  injects: [Logger],
})
@UseMiddleware(JSONMiddleware)
class FooController {
  constructor(private readonly logger: Logger) {
    logger.debug('created');
  }

  // GET /foo/:bar validates route params.
  @Get('/:bar', {
    injects: [Params(FooParams)],
  })
  getFoo(params: Params<typeof FooParams>): RawObject {
    this.logger.debug('getFoo() called');

    return {
      params,
    };
  }

  // Body injects the raw parsed body; Body(FooBody) injects the validated body.
  @Post('/:bar', {
    injects: [Params(FooParams), Body, Body(FooBody)],
  })
  postFoo(
    params: Params<typeof FooParams>,
    bodyRaw: unknown,
    body: Body<typeof FooBody>,
  ): RawObject {
    this.logger.debug('postFoo() called');

    return {
      params,
      body,
      bodyRaw,
    };
  }
}

// JSONModule makes JSON middleware available for injection/use by the HTTP layer.
@Module({
  imports: [LoggerModule, HttpModule, JSONModule],
  controllers: [FooController],
})
class AppModule {}

await App.start(AppModule);
