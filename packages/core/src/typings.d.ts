declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: string;
      LOG_LEVEL?: string;
      LOG_FORMAT?: string;
      USE_LOG_COLORS?: string;
      LOG_INSPECT_DEPTH?: string;
    }
  }
}

export {};
