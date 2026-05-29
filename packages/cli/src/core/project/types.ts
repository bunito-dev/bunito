export type ProjectState = {
  name: string;
  path: string;
  initialized?: boolean;
  root?: boolean;
  apps?: Set<string>;
  libs?: Set<string>;
};

export type AppOptions = {
  name: string;
  root: boolean;
};

export type AppState = AppOptions & {
  prefix: string;
  entryFile: string;
  envsFile: string;
  outFile: string;
  outPath: string;
};
