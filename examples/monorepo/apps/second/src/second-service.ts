import { Logger, OnAppStart, Provider } from '@bunito/bunito';
import { ExampleService } from '@libs/example';

@Provider({
  injects: [Logger, ExampleService],
})
export class SecondService {
  constructor(
    private readonly logger: Logger,
    private readonly exampleService: ExampleService,
  ) {
    logger.setContext(SecondService);
  }

  @OnAppStart()
  onStart() {
    this.logger.debug('onStart() called:', this.exampleService.example());
  }
}
