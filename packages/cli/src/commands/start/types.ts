import type { ProcessLabelStyle } from '../../core';

export type StartOptions = {
  app: Set<string> | null;
  apps: boolean;
  root: boolean;
  watch: boolean;
  prod: boolean;
  label: ProcessLabelStyle;
};
