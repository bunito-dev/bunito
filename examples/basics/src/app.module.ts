import { Logger, LoggerModule, Module, OnAppStart } from '@bunito/bunito';
import { BarModule } from './bar';
import { FooModule } from './foo';

@Module({
  imports: [LoggerModule, BarModule, FooModule],
  injects: [Logger],
})
export class AppModule {
  constructor(private readonly logger: Logger) {}

  @OnAppStart()
  onStart(): void {
    this.logger?.debug('onStart() called');
  }
}
