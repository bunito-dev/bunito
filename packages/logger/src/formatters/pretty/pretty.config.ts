import { defineConfig } from '@bunito/config';

export const PrettyConfig = defineConfig<{
  disableColor: boolean;
  inspectDepth: number;
}>(
  'Pretty',
  ({ getEnv }) => ({
    disableColor: getEnv('DISABLE_LOG_COLORS', 'boolean'),
    inspectDepth: getEnv('LOG_INSPECT_DEPTH', 'integer'),
  }),
  {
    disableColor: false,
    inspectDepth: 10,
  },
);
