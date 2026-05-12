import { Logger, LoggerModule, Module, OnAppStart } from '@bunito/bunito';
import { BarService } from './bar-service';
import { FooService } from './foo-service';

@Module({
  imports: [LoggerModule],
  providers: [FooService, BarService],
  injects: [Logger],
})
export class AppModule {
  constructor(private readonly logger: Logger) {
    this.logger.setContext(AppModule);
  }

  @OnAppStart()
  onStart(): void {
    // App-level hooks are useful for startup work that belongs to the module.
    this.logger.debug('onStart() called');
  }
}
