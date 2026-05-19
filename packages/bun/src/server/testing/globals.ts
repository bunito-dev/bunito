declare global {
  namespace Bunito {
    interface Test {
      ServerModule: import('@bunito/container').ModuleOptions;
      serverFactory: (
        options: import('../types').ServerOptions,
      ) => import('./test-server').TestServer;
      server: import('./test-server').TestServer;
    }
  }
}
