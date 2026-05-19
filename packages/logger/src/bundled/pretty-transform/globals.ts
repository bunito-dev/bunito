declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISABLE_PRETTY_COLORS?: string;
      PRETTY_INSPECT_DEPTH?: string;
    }
  }
}
