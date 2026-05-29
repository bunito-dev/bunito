export type BuildOptions = {
  app: Set<string> | null;
  apps: boolean;
  root: boolean;
  disable: Set<'sourcemap' | 'minify'> | null;
};
