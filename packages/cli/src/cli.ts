#!/usr/bin/env bun

import * as process from 'node:process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { StartCommand } from './commands';
import { Project } from './project';

const project = await Project.read(process.cwd());

await yargs(hideBin(process.argv))
  .scriptName('bunito')
  .command({
    command: 'init [project]',
    aliases: ['i'],
    describe: 'Initialize a new project',
    builder: (yargs) =>
      yargs.positional('project', {
        describe: 'Project name',
        type: 'string',
        required: true,
      }),
    handler: async () => {
      if (project) {
        throw new Error('Project already initialized');
      }

      throw new Error('Command not implemented yet ;(');
    },
  })
  .command({
    command: 'start [apps...]',
    aliases: ['s'],
    describe: 'Start the app(s)',
    builder: (yargs) =>
      yargs
        .example('$0 start', 'Start all apps')
        .example('$0 start foo', 'Start the foo app')
        .example('$0 start foo bar', 'Start the foo and the bar apps')
        .positional('apps', {
          nullable: true,
          describe: 'App names',
          array: true,
          type: 'string',
          coerce: (apps: string[]) => (apps.length ? new Set(apps) : undefined),
        })
        .option('watch', {
          describe: 'Watch for changes',
          default: false,
          type: 'boolean',
          alias: 'w',
        })
        .option('prod', {
          describe: 'Run in production mode',
          default: false,
          type: 'boolean',
          alias: 'p',
        }),
    handler: async (options) => {
      if (!project) {
        throw new Error('Project not initialized');
      }

      await new StartCommand(project).run(options);
    },
  })
  .command({
    command: 'build [apps...]',
    aliases: ['b'],
    describe: 'Build the app(s)',
    builder: (yargs) =>
      yargs.positional('apps', {
        describe: 'App names',
        array: true,
        type: 'string',
        coerce: (apps: string[]) => (apps.length ? new Set(apps) : undefined),
      }),
    handler: async () => {
      if (!project) {
        throw new Error('Project not initialized');
      }

      throw new Error('Command not implemented yet ;(');
    },
  })
  .strictCommands()
  .demandCommand(1, 'You need at least one command before moving on...')
  .completion('completion', 'Generate completion script')
  .help()
  .alias({
    h: 'help',
    v: 'version',
  })
  .fail((msg, err, yargs) => {
    if (Error.isError(err)) {
      console.error(err.message);
    } else if (msg) {
      console.error(msg);
    } else {
      console.error('Unknown error');
    }
    console.log();
    console.log(yargs.help());
    process.exit(0);
  })
  .parseAsync();
