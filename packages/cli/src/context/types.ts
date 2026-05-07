import type {
  CLIService,
  FSService,
  LoggerService,
  ProjectService,
  SpawnService,
} from '#services';

export type ContextSettings = {
  cwd: string;
  argv: string[];
  debug?: boolean;
  readonly?: boolean;
  pkgVersion: string;
  bunVersion?: string;
};

export type ContextServices = Partial<{
  cli: CLIService;
  fs: FSService;
  logger: LoggerService;
  project: ProjectService;
  spawn: SpawnService;
}>;

export type ContextService<TName extends keyof ContextServices> = Exclude<
  ContextServices[TName],
  undefined
>;
