import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { ComposedModule } from '@app';
import { BrokerService, Payload } from '@bunito/broker';
import { App } from '@bunito/bunito';
import { HTTPModule } from '@bunito/http';
import { Test } from '@bunito/testing';

const TEST_MESSAGE = 'Hello!';

describe('composed', async () => {
  let app: App | undefined;
  let brokerService: BrokerService | undefined;

  beforeAll(async () => {
    app = await App.start({
      imports: [
        Test.BunServerModule,
        Test.ConfigModule,
        Test.LoggerModule,
        HTTPModule,
        Test.BrokerModule,
        ComposedModule,
      ],
    });

    brokerService = await app.resolve(BrokerService);
  });

  afterAll(async () => {
    await app?.shutdown();
  });

  test('foo.process topic', async () => {
    const payload = await brokerService?.sendRequest('foo.process', TEST_MESSAGE);

    expect(payload?.decode<string>()).toBe(`${TEST_MESSAGE} ... I'm foo!`);

    expect(Test.broker.sendRequest).toBeCalledWith('foo.process', expect.any(Payload));
  });

  test('bar.process topic', async () => {
    const payload = await brokerService?.sendRequest('bar.process', TEST_MESSAGE);

    expect(payload?.decode<string>()).toBe(`${TEST_MESSAGE} ... I'm bar!`);

    expect(Test.broker.sendRequest).toBeCalledWith('bar.process', expect.any(Payload));
  });
});
