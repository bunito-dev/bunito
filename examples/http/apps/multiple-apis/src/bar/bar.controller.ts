import { Controller, Logger, optional } from '@bunito/bunito';
import { Get, NotFoundException, Params } from '@bunito/http';
import { BarParams } from './schemas';

@Controller('/', {
  injects: [optional(Logger)],
  scope: 'singleton',
})
export class BarController {
  constructor(private readonly logger: Logger | null) {
    logger?.debug('created');
  }

  @Get('/:bar', {
    injects: [Params(BarParams)],
  })
  getBar(params: Params<typeof BarParams>): Response {
    this.logger?.debug('getBar() called');

    return Response.json({
      action: 'getBar',
      params,
    });
  }

  @Get()
  @Get('/*')
  notFound(): never {
    throw new NotFoundException();
  }
}
