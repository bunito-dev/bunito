import type { RawObject } from '@bunito/bunito';
import { Controller, Logger } from '@bunito/bunito';
import { Get, NotFoundException, Params } from '@bunito/http';
import { BarParams } from './schemas';

@Controller('/', {
  injects: [Logger],
  scope: 'singleton',
})
export class BarController {
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
