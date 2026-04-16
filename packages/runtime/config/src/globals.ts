declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: 'production' | 'development' | 'test' | (string & {});
      CI?: 'true' | (string & {});
      TZ?: string;
    }
  }
}
