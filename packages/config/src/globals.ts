declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CONFIG_READERS?: string;
    }
  }

  namespace Bunito {
    interface Module {
      configs: import('./types').ConfigProvider<unknown>[];
    }
  }
}
