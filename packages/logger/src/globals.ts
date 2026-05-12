declare global {
  namespace NodeJS {
    interface ProcessEnv {
      LOG_LEVEL?: string;
      LOG_FORMAT?: string;
    }
  }
}
