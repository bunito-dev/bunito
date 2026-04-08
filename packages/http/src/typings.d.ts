declare global {
  namespace NodeJS {
    interface ProcessEnv {
      HTTP_PORT?: string;
      PORT?: string;
      DEFAULT_CONTENT_TYPE?: string;
    }
  }
}

export {};
