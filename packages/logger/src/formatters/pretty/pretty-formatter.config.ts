import { defineConfig } from '@bunito/config';

export const PrettyFormatterConfig = defineConfig(function PrettyFormatter({ getEnv }) {
  return {
    disableColor: getEnv('DISABLE_LOG_COLORS', 'boolean') ?? false,
    inspectDepth: getEnv('LOG_INSPECT_DEPTH', 'integer') ?? 10,
  };
});
