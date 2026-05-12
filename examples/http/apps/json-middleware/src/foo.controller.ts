import type { RawObject } from '@bunito/bunito';
import { Controller, Logger } from '@bunito/bunito';
import {
  Body,
  BodyParser,
  Get,
  JSONSerializer,
  Params,
  Post,
  UseMiddleware,
} from '@bunito/http';
import { FooBody, FooParams } from './schemas';

@Controller('/foo', {
  injects: [Logger],
})
@UseMiddleware(JSONSerializer)
@UseMiddleware(BodyParser, { parser: 'json' })
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
