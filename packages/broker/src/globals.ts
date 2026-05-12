declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BROKER_ADAPTER?: string;
    }
  }
}
