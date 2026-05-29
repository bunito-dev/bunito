import { Logger, optional, Provider } from '@bunito/bunito';

@Provider({
  injects: [optional(Logger)],
})
export class ExampleService {
  // Optional injects let the library work with or without LoggerModule.
  constructor(private readonly logger: Logger | null = null) {}

  example(): string {
    this.logger?.debug('example() called');

    return 'example';
  }
}
