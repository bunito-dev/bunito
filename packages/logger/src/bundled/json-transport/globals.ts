declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISABLE_LOG_COLORS?: string;
      LOG_INSPECT_DEPTH?: string;
    }
  }
}
