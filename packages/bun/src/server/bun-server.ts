export interface BunServer {
  readonly url: URL;

  upgrade(
    request: Request,
    options?: {
      headers?: HeadersInit;
      data?: unknown;
    },
  ): boolean;

  stop(closeActiveConnections?: boolean): Promise<void>;
}
