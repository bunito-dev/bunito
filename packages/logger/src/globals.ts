declare global {
  namespace NodeJS {
    interface ProcessEnv {
      LOG_LEVEL?: string;
      LOG_TRANSPORT?: string;
      EXIT_ON_FATAL?: string;
    }
  }
}
