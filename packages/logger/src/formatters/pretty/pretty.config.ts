import { defineConfig } from '@bunito/config';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISABLE_LOG_COLORS?: string;
      LOG_INSPECT_DEPTH?: string;
    }
  }
}

export const PrettyConfig = defineConfig<{
  disableColor: boolean;
  inspectDepth: number;
}>(
  'Pretty',
  {
    disableColor: false,
    inspectDepth: 10,
  },
  ({ getEnv }) => ({
    disableColor: getEnv('DISABLE_LOG_COLORS', 'boolean'),
    inspectDepth: getEnv('LOG_INSPECT_DEPTH', 'integer'),
  }),
);
