import { defineConfig } from '@bunito/config';

export const PrettyConfig = defineConfig(function Pretty({ getEnv }) {
  return {
    disableColor: getEnv('DISABLE_LOG_COLORS', 'boolean') ?? false,
    inspectDepth: getEnv('LOG_INSPECT_DEPTH', 'integer') ?? 10,
  };
});
