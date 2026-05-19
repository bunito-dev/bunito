import type { TokenLike } from '@bunito/container';
import type { TestLogger } from './test-logger';

export type TestLoggerGetter = (context?: TokenLike) => TestLogger;
