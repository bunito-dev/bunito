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

const FooParams = z.object({
  bar: z.string().max(2),
});

const FooBody = z.object({
  foo: z.string().default("I'm a foo"),
  bar: z.string().default("I'm a bar"),
});

@Controller('/foo', {
  injects: [Logger],
})
@UseMiddleware(JSONMiddleware)
class FooController {
  constructor(private readonly logger: Logger) {
    logger.debug('created');
  }

  @Get('/:bar', {
    injects: [Params(FooParams)],
  })
  getFoo(params: Params<typeof FooParams>): RawObject {
    this.logger.debug('getFoo() called');

    return {
      params,
    };
  }

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

@Module({
  imports: [LoggerModule, HttpModule, JSONModule],
  controllers: [FooController],
})
class AppModule {}

await App.start(AppModule);
