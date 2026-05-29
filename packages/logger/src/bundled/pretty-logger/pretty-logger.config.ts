import { defineConfig } from '@bunito/config';

export const PrettyLoggerConfig = defineConfig<{
  disableColor: boolean;
  inspectDepth: number;
}>(function PrettyLogger({ getEnv }) {
  return {
    disableColor: getEnv?.('DISABLE_LOG_COLORS', 'boolean') ?? false,
    inspectDepth: getEnv?.('LOG_INSPECT_DEPTH', 'integer') ?? 10,
  };
});
