import { Controller, Logger, optional } from '@bunito/bunito';
import { Get, Params } from '@bunito/http';
import { FooParams } from './schemas';

@Controller('/', {
  injects: [optional(Logger)],
  scope: 'singleton',
})
export class FooController {
  constructor(private readonly logger: Logger | null) {
    logger?.debug('created');
  }

  @Get('/:foo', {
    injects: [Params(FooParams)],
  })
  getFoo(params: Params<typeof FooParams>): Response {
    this.logger?.debug('getFoo() called');

    return new Response(`foo: ${params.foo}`);
  }
}
