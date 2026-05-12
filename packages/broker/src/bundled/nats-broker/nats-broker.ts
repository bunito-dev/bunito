import { InternalException } from '@bunito/common';
import type { ResolveConfig } from '@bunito/config';
import type { NatsConnection } from '@nats-io/transport-node';
import { BrokerAdapter } from '../../broker-adapter';
import type { MessageHandler, MessagePayload } from '../../types';
import { NatsBrokerConfig } from './nats-broker-config';
import type { NatsBrokerContext } from './types';

@BrokerAdapter<NatsBrokerContext>({
  injects: [NatsBrokerConfig],
})
export class NatsBroker implements BrokerAdapter<NatsBrokerContext> {
  readonly NAME = 'nats';

  private connection: undefined | NatsConnection;

  constructor(private readonly config: ResolveConfig<typeof NatsBrokerConfig>) {}

  async connect(): Promise<void> {
    if (this.connection) {
      return;
    }

    try {
      const { connect } = await import('@nats-io/transport-node');
      const { servers } = this.config;

      this.connection = await connect({
        servers,
      });
    } catch {
      throw new InternalException('@nats-io/transport-node is not installed');
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connection) {
      return;
    }

    await this.connection.close();
  }

  async sendRequest(topic: string, data: unknown): Promise<unknown> {
    if (!this.connection) {
      return;
    }

    const msg = await this.connection.request(topic, JSON.stringify(data));

    return msg.json();
  }

  async sendEvent(topic: string, data: unknown): Promise<boolean> {
    if (!this.connection) {
      return false;
    }

    this.connection.publish(topic, JSON.stringify(data));

    return true;
  }

  async sendResponse(msg: NatsBrokerContext, data: unknown): Promise<boolean> {
    return msg.respond(JSON.stringify(data));
  }

  subscribe(pattern: string, handler: MessageHandler<NatsBrokerContext>): void {
    if (!this.connection) {
      return;
    }

    const { queue } = this.config;

    this.connection?.subscribe(pattern, {
      queue: `NatsBroker:${queue}`,
      callback: (err, msg) => {
        if (err) {
          handler(err);
          return;
        }

        const data = msg.json<MessagePayload>();

        handler(null, {
          context: msg,
          kind: msg.reply ? 'request' : 'event',
          topic: msg.subject,
          data,
        });
      },
    });
  }
}
