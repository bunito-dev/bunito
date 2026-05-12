import { Controller, Logger } from '@bunito/bunito';
import { Get, Params } from '@bunito/http';
import { FooParams } from './schemas';

@Controller('/', {
  injects: [Logger],
  scope: 'singleton',
})
export class FooController {
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
