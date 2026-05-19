declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: string;
      CI?: string;
      TZ?: string;
      CONFIG_READERS?: string;
    }
  }

  namespace Bunito {
    interface Module {
      configs: import('./types').ConfigProvider<unknown>[];
    }

    interface Test {
      ConfigModule: import('@bunito/container').ModuleOptions;
    }
  }
}
