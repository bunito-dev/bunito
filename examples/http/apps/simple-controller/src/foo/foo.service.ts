import { Logger, optional, Provider } from '@bunito/bunito';

@Provider({
  injects: [optional(Logger)],
})
export class FooService {
  constructor(private readonly logger: Logger | null) {
    logger?.debug('created');
  }

  foo(): string {
    this.logger?.debug('foo() called');

    return 'bar';
  }
}
