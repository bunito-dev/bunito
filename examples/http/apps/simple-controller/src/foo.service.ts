import { Logger, Provider } from '@bunito/bunito';

@Provider({
  injects: [Logger],
})
export class FooService {
  constructor(private readonly logger: Logger) {
    logger.setContext(FooService);
    logger.debug('created');
  }

  foo(): string {
    this.logger.debug('foo() called');

    return 'bar';
  }
}
