declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DEFAULT_RESPONSE_CONTENT_TYPE?: string;
    }
  }
}
