declare global {
  namespace Bunito {
    interface Test {
      ConfigModule: import('@bunito/container').ModuleOptions;
      configService: import('./types').TestConfigService;
    }
  }
}
