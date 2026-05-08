import type { RawObject } from '@bunito/bunito';
import { Logger } from '@bunito/bunito';
import {
  Body,
  Controller,
  Get,
  JSONMiddleware,
  Params,
  Post,
  UseMiddleware,
} from '@bunito/http';
import { FooBody, FooParams } from './schemas';

@Controller('/foo', {
  injects: [Logger],
})
// JSONMiddleware serializes plain object responses and parses JSON request bodies.
@UseMiddleware(JSONMiddleware)
export class FooController {
  constructor(private readonly logger: Logger) {
    logger.setContext(FooController);
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
    injects: [Params(FooParams), Body(), Body(FooBody)],
  })
  postFoo(
    params: Params<typeof FooParams>,
    rawBody: unknown,
    body: Body<typeof FooBody>,
  ): RawObject {
    // Body() returns the parsed body; Body(schema) returns the validated body.
    this.logger.debug('postFoo() called');

    return {
      params,
      rawBody,
      body,
    };
  }
}
