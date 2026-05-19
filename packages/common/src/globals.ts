declare module 'bun:bundle' {
  interface Registry {
    features: 'TEST_ONLY' | 'DEV_ONLY' | 'PROD_ONLY' | (string & {});
  }
}
