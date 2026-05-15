#!/usr/bin/env bun

import * as process from 'node:process';
import { hideBin } from 'yargs/helpers';
import { Context } from './context';
import {
  CLIService,
  FSService,
  LoggerService,
  ProjectService,
  SpawnService,
} from './services';
import './commands';

const context = new Context()
  .createService('cli', CLIService)
  .createService('fs', FSService)
  .createService('logger', LoggerService)
  .createService('project', ProjectService)
  .createService('spawn', SpawnService);

const { project, cli } = context;

const cwd = process.cwd();
const argv = hideBin([...process.argv]);

await context.loadSettings(cwd, argv);
await project.loadState();

await cli.runCommand(argv);
