import type { ResolveConfig } from '@bunito/core';
import { Logger, OnBoot, OnDestroy, Provider } from '@bunito/core';
import { HttpConfig } from './http.config';
import { RoutingService } from './routing';

@Provider({
  injects: [HttpConfig, Logger, RoutingService],
})
export class HttpService {
  private server: Bun.Server<unknown> | undefined;

  constructor(
    private readonly config: ResolveConfig<typeof HttpConfig>,
    private readonly logger: Logger,
    private readonly router: RoutingService,
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
      fetch: async (request) => this.router.processRequest(request),
    });

    this.logger.ok(`Server started at ${this.server.url}`);
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
