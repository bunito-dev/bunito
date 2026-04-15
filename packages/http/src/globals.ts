declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DEFAULT_CONTENT_TYPE?: string;
    }
  }

  namespace Bonito {
    interface ModuleComponents {
      controllers: import('@bunito/common').Class[];
    }
  }
}
