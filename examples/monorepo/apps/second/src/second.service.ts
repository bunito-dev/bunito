import { Logger, OnAppStart, optional, Provider } from '@bunito/bunito';
import { ExampleService } from '@libs/example';

@Provider({
  injects: [optional(Logger), ExampleService],
})
export class SecondService {
  constructor(
    private readonly logger: Logger | null,
    private readonly exampleService: ExampleService,
  ) {}

  @OnAppStart()
  onStart() {
    this.logger?.debug('onStart() called:', this.exampleService.example());
  }
}
