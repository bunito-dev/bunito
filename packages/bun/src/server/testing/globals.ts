declare global {
  namespace Bunito {
    interface Test {
      BunServerModule: import('@bunito/container').ModuleOptions;
      bunServerFactory: import('./types').TestBunServerFactory;
      bunServer: import('./test-bun-server').TestBunServer;
    }
  }
}
