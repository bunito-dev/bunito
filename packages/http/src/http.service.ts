import type { ResolveConfig } from '@bunito/core';
import { Logger, OnBoot, OnDestroy, Provider } from '@bunito/core';
import { HttpConfig } from './http.config';
import { HttpException } from './http.exception';
import { RoutingService } from './routing';

@Provider({
  injects: [HttpConfig, RoutingService, Logger],
})
export class HttpService {
  private server: Bun.Server<unknown> | undefined;

  constructor(
    private readonly config: ResolveConfig<typeof HttpConfig>,
    private readonly router: RoutingService,
    private readonly logger: Logger,
  ) {
    logger.setContext(HttpService);
  }

  @OnBoot()
  startServer(): void {
    if (this.server) {
      this.logger.warn('Server already running');
      return;
    }

    const { port } = this.config;

    this.server = Bun.serve({
      port,
      fetch: async (request) => {
        let exception: HttpException;

        try {
          const response = await this.router.processRequest(request);

          if (response) {
            return response;
          }
          exception = new HttpException('NOT_FOUND');
        } catch (err) {
          exception = HttpException.capture(err);

          if (exception.cause) {
            this.logger.error('Unhandled exception', exception.cause);
          }
        }

        return exception.toResponse();
      },
    });

    this.logger.ok(`Server started: ${this.server.url}`);
  }

  @OnDestroy()
  async stopServer(): Promise<void> {
    if (!this.server) {
      this.logger.warn('Server not running');
      return;
    }

    this.logger.trace('Stopping server...');
    await this.server.stop(true);
    this.logger.ok('Server stopped');

    this.server = undefined;
  }
}
