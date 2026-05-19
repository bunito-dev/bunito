import { expect, test } from 'bun:test';
import { App, Test } from '@bunito/bunito';
import { AppModule } from './app-module';

test('main', async () => {
  const app = await Test.App.start(AppModule);

  expect(app.logger.setContext).toHaveBeenCalledWith(App);
  expect(app.logger.debug).toHaveBeenCalledWith('onStart() called');
  expect(app.logger.debug).toHaveBeenCalledWith('created');
  expect(app.logger.debug).toHaveBeenCalledWith('onInit() called');
  expect(app.logger.debug).toHaveBeenCalledWith('onAppStart() called');
});
