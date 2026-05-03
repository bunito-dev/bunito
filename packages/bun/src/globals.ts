declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      HOSTNAME?: string;
      SERVER_PORT?: string;
      SERVER_HOSTNAME?: string;
    }
  }
}
