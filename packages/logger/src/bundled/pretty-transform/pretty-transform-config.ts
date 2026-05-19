import { defineConfig } from '@bunito/config';

export const PrettyTransformConfig = defineConfig<{
  disableColor: boolean;
  inspectDepth: number;
}>(function PrettyTransform({ getEnv }) {
  return {
    disableColor: getEnv?.('DISABLE_LOG_COLORS', 'boolean') ?? false,
    inspectDepth: getEnv?.('LOG_INSPECT_DEPTH', 'integer') ?? 10,
  };
});
