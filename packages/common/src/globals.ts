declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: string;
      CI?: string;
      TZ?: string;
      HIDE_WARNINGS?: string;
    }
  }
}

declare module 'bun:bundle' {
  interface Registry {
    features: 'RUNTIME_ONLY' | (string & {});
  }
}
