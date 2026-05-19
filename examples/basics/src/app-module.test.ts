import { expect, test } from 'bun:test';
import { Test } from '@bunito/bunito';
import { AppModule } from './app-module';

test('AppModule', async () => {
  const { logger } = Test;

  new AppModule(logger);

  expect(logger.setContext).toHaveBeenCalledWith(AppModule);
});
