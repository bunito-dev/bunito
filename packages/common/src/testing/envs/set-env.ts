import * as process from 'node:process';

export function setEnv(
  key: Exclude<keyof NodeJS.ProcessEnv, number> | (string & {}),
  value?: string,
): void {
  process.env[key] = value;
}
