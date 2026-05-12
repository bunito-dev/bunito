export type EnvKey = Exclude<keyof NodeJS.ProcessEnv, number> | (string & {});
