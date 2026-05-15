import { InternalException } from '@bunito/common';
import type { ResolveConfig } from '@bunito/config';
import type { NatsConnection } from '@nats-io/transport-node';
import { BrokerAdapter } from '../../broker-adapter';
import type { BrokerMessageHandler } from '../../types';
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

  async sendRequest(topic: string, payload: Uint8Array): Promise<Uint8Array> {
    const { data } = await this.getConnection().request(topic, payload);

    return data;
  }

  async sendEvent(topic: string, payload: Uint8Array): Promise<boolean> {
    this.getConnection().publish(topic, payload);

    return true;
  }

  async sendResponse(msg: NatsBrokerContext, payload: Uint8Array): Promise<boolean> {
    return msg.respond(payload);
  }

  subscribe(pattern: string, handler: BrokerMessageHandler<NatsBrokerContext>): void {
    const { queue } = this.config;

    this.getConnection().subscribe(pattern, {
      queue: `NatsBroker:${queue}`,
      callback: (err, msg) => {
        if (err) {
          handler(err);
          return;
        }

        handler(null, {
          context: msg,
          kind: msg.reply ? 'request' : 'event',
          topic: msg.subject,
          payload: msg.data,
        });
      },
    });
  }

  private getConnection(): NatsConnection {
    if (!this.connection) {
      throw new InternalException('Nats connection is not available');
    }

    return this.connection;
  }
}
