#!/usr/bin/env bun

import { App } from '@bunito/app';
import { ConfigModule, overwriteConfigEnvs } from '@bunito/config';
import { LoggerModule } from '@bunito/logger';
import { CommandModule } from './commands';
import { CLILogTransport } from './core';

await App.start(
  {
    imports: [ConfigModule, LoggerModule, CommandModule],
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
