declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DEFAULT_RESPONSE_CONTENT_TYPE?: string;
    }
  }

  namespace Bunito {
    interface ModuleProviders {
      controllers: import('@bunito/common').Class[];
    }
  }
}
