declare global {
  namespace Bunito {
    interface Test {
      BunSecretsModule: import('@bunito/container').ModuleOptions;
      bunSecretsService: import('./types').TestBunSecretsService;
    }
  }
}
