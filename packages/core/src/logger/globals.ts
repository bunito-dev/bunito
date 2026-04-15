declare global {
  namespace NodeJS {
    interface ProcessEnv {
      LOG_LEVEL?: string;
      LOG_FORMAT?: string;
      LOG_COLORS?: string;
      LOG_INSPECT_DEPTH?: string;
    }
  }

  namespace Bonito {
    interface ModuleComponents {
      formatters: import('@bunito/common').Class[];
    }
  }
}
