#!/usr/bin/env bun

import { startApp } from '@bunito/app';
import { overwriteConfigEnvs } from '@bunito/config';
import { CommandModule } from './commands';
import { CLILogTransport } from './core';

await startApp({
  imports: [CommandModule],
  providers: [
    CLILogTransport,
    overwriteConfigEnvs({
      LOG_LEVEL: 'INFO',
      LOG_TRANSPORT: 'cli',
    }),
  ],
});
