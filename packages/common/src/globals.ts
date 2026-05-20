declare module 'bun:bundle' {
  interface Registry {
    features: 'RUNTIME_ONLY' | (string & {});
  }
}
