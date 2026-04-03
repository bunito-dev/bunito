import type { ResolveConfig } from '@bunito/core';
import { Logger, OnBoot, OnDestroy, Provider } from '@bunito/core';
import { HttpConfig } from './http.config';
import { HttpRouter } from './http.router';

@Provider({
  injects: [HttpConfig, HttpRouter, Logger],
})
export class HttpService {
  private server: Bun.Server<unknown> | undefined;

  constructor(
    private readonly config: ResolveConfig<typeof HttpConfig>,
    private readonly router: HttpRouter,
    private readonly logger: Logger,
  ) {
    logger.setContext(HttpService);
  }

  @OnBoot()
  startServer(): void {
    const { port } = this.config;

    this.server = Bun.serve({
      port,
      fetch: (request) => this.router.processRequest(request),
    });

    this.logger.ok(`Server listening on ${port}`);

    this.logger.debug(`http://localhost:${port}`);
  }

  async stop(): Promise<void> {
    await this.server?.stop();
  }

  @OnDestroy()
  async stopServer(): Promise<void> {}
}
