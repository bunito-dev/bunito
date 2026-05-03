declare global {
  namespace NodeJS {
    interface ProcessEnv {
      LOG_LEVEL?: string;
      LOG_FORMAT?: string;
      // pretty
      DISABLE_LOG_COLORS?: string;
      LOG_INSPECT_DEPTH?: string;
    }
  }
}
