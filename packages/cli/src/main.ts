#!/usr/bin/env bun

import { App } from '@bunito/app';
import { overwriteConfigEnvs } from '@bunito/config';
import { CommandModule } from './commands';
import { CLILogTransport } from './core';

await App.start(
  {
    imports: [CommandModule],
    providers: [
      CLILogTransport,
      overwriteConfigEnvs({
        LOG_LEVEL: 'verbose',
        LOG_TRANSPORT: 'cli',
      }),
    ],
  },
  {
    silent: true,
  },
);
