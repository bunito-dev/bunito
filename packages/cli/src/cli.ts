#!/usr/bin/env bun

import * as process from 'node:process';
import { StartCommand } from './commands';
import { CliException } from './exceptions';

const [arg0, ...args] = process.argv.slice(2);

let command: StartCommand;

switch (arg0) {
  case 'start': {
    command = new StartCommand();
    break;
  }

  case undefined:
    args.push('-h');
    command = new StartCommand();
    break;

  default:
    args.unshift(arg0);
    command = new StartCommand();
}

try {
  await command.processArgs(args);

  await command.execute();
} catch (err) {
  if (CliException.isInstance(err)) {
    console.log(err.message);
  } else {
    console.log('Something went wrong ...');
  }
  process.exit(1);
}
