declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NATS_BROKER_SERVERS?: string;
      NATS_BROKER_QUEUE?: string;
    }
  }
}
