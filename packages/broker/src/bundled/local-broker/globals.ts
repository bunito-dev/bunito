declare global {
  namespace NodeJS {
    interface ProcessEnv {
      LOCAL_BROKER_MODE?: string;
      LOCAL_BROKER_UID?: string;
      LOCAL_BROKER_DATA_DIR?: string;
    }
  }
}
