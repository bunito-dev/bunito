import type { WithBase } from '@bunito/common';

export type ProjectSettings = WithBase<
  {
    name: string;
    path: string;
  },
  {
    mode: 'monorepo';
    apps: Record<string, ProjectApp>;
  },
  {
    mode: 'standard';
    entry: string;
  },
  {
    mode: 'unknown';
  }
>;

export type ProjectApp = {
  path: string;
  entry: string;
};
