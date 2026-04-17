export type ProjectApp = {
  name: string;
  entry: string;
  prefix: string;
  envs?: Record<string, string | undefined>;
};

export type ProjectConfig = {
  apps: Record<string, Omit<ProjectApp, 'prefix' | 'name'>>;
};
