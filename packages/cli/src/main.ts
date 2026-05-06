#!/usr/bin/env bun

import * as process from 'node:process';
import { hideBin } from 'yargs/helpers';
import { CLI } from './cli';
import { FS, Logger } from './common';
import './commands';

const argv = hideBin([...process.argv, 'aaaa']);

const cli = new CLI(argv, new Logger(), new FS());
await cli.load();
await cli.runCommand();
