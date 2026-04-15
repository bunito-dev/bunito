declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      HOSTNAME?: string;
      SERVER_PORT?: string;
      SERVER_HOSTNAME?: string;
    }
  }

  namespace Bonito {
    interface ModuleComponents {
      routers: import('@bunito/common').Class[];
    }
  }
}
