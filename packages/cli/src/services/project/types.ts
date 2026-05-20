export type ProjectState = {
  name: string;
  path: string;
  initialized?: boolean;
  app?: boolean;
  apps?: Set<string>;
  libs?: Set<string>;
};

export type App = {
  name: string;
  root: boolean;
  path: string;
};
