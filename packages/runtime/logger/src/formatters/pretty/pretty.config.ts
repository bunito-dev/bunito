import { defineConfig } from '@bunito/config';

export const PrettyConfig = defineConfig<{
  colors: boolean;
  inspectDepth: number;
}>('Pretty', ({ getEnv }) => ({
  colors: getEnv('LOG_COLORS', 'boolean') ?? true,
  inspectDepth: getEnv('LOG_INSPECT_DEPTH', 'toInteger', [1, 20]) ?? 10,
}));
