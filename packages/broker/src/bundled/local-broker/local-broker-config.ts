import { join } from 'node:path';
import { InternalException } from '@bunito/common';
import { defineConfig } from '@bunito/config';

export const LocalBrokerConfig = defineConfig(function LocalBroker({ getEnv }) {
  const mode =
    getEnv('LOCAL_BROKER_MODE', 'lowercase', (value: string): 'in-memory' | 'fs' => {
      switch (value) {
        case 'in-memory':
        case 'fs':
          return value;

        default:
          throw new InternalException(`Invalid LOCAL_BROKER_MODE value: ${value}`);
      }
    }) ?? 'in-memory';

  return {
    mode,
    uid: getEnv('LOCAL_BROKER_UID') ?? process.pid.toString(10),
    dataDir: getEnv('LOCAL_BROKER_DATA_DIR') ?? join(process.cwd(), '.cache', 'broker'),
  };
});
