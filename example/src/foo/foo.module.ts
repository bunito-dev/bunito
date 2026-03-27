import { Bootstrap, Destroy, Logger, LoggerModule, Module, Setup } from '@bunito/core';
import { Route } from '@bunito/http';
import { DemoModule } from './demo';
import { FooController } from './foo.controller';

@Module({
  imports: [DemoModule, LoggerModule],
  controllers: [FooController],
  exports: [],
  injects: [Logger],
})
@Route('/foo')
export class FooModule {
  constructor(private readonly logger: Logger) {
    logger.setContext(FooModule);
  }

  @Setup()
  setup(): void {
    this.logger.info('setup');
  }

  @Bootstrap()
  bootstrap(): void {
    this.logger.info('bootstrap');
  }

  @Destroy()
  destroy(): void {
    this.logger.info('destroy');
  }
}
