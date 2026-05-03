declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: string;
      CI?: string;
      TZ?: string;
    }
  }

  namespace Bunito {
    interface ModuleProviders {
      configs: import('./types').ConfigProvider<unknown>[];
    }
  }
}
