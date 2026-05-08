import { Logger, Provider } from '@bunito/bunito';

@Provider({
  injects: [
    {
      useToken: Logger,
      optional: true,
    },
  ],
})
export class ExampleService {
  // Optional injects let the library work with or without LoggerModule.
  constructor(private readonly logger: Logger | null = null) {
    logger?.setContext(ExampleService);
  }

  example(): string {
    this.logger?.debug('example() called');

    return 'example';
  }
}
