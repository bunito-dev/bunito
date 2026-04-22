import { defineConfig } from '@bunito/config';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      LOG_COLORS?: string;
      LOG_INSPECT_DEPTH?: string;
    }
  }
}

export const PrettyConfig = defineConfig<{
  colors: boolean;
  inspectDepth: number;
}>('Pretty', ({ getEnv }) => ({
  colors: getEnv('LOG_COLORS', 'boolean') ?? true,
  inspectDepth: getEnv('LOG_INSPECT_DEPTH', 'toInteger', [1, 20]) ?? 10,
}));
