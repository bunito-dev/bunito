import type { WithBase } from '@bunito/common';

export type ProjectSettings = WithBase<
  {
    name: string;
    path: string;
  },
  {
    mode: 'monorepo';
    apps: Map<string, ProjectApp>;
    libs?: Set<string>;
  },
  {
    mode: 'standard';
  } & Omit<ProjectApp, 'name' | 'path'>,
  {
    mode: 'unknown';
  }
>;

export type ProjectApp = {
  name: string;
  path: string;
  entry: string;
  envs?: string;
};
