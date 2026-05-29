import { join } from 'node:path';
import { InternalException } from '@bunito/common';
import { defineConfig } from '@bunito/config';

export const LocalBrokerConfig = defineConfig(function LocalBroker(context) {
  const mode =
    context.getEnv?.(
      'LOCAL_BROKER_MODE',
      'lowercase',
      (value: string): 'in-memory' | 'fs' => {
        switch (value) {
          case 'in-memory':
          case 'fs':
            return value;

          default:
            throw new InternalException(`Invalid LOCAL_BROKER_MODE value: ${value}`);
        }
      },
    ) ?? 'in-memory';

  return {
    mode,
    uid: context.getEnv?.('LOCAL_BROKER_UID') ?? Bun.hash(Bun.main).toString(16),
    timeout: context.getEnv?.('LOCAL_BROKER_TIMEOUT', 'integer') ?? 250,
    dataDir:
      context.getEnv?.('LOCAL_BROKER_DATA_DIR') ??
      join(process.cwd(), '.cache', 'broker'),
  };
});
