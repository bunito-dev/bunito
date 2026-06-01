import { InternalException } from '@bunito/common';
import type { ResolveConfig } from '@bunito/config';
import type { NatsConnection } from '@nats-io/transport-node';
import { BrokerAdapter } from '../../broker-adapter';
import type { BrokerMessageHandler } from '../../types';
import { Payload } from '../../utils';
import { NatsBrokerConfig } from './nats-broker.config';
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

  async sendRequest(topic: string, payload: Payload): Promise<Payload> {
    const { data } = await this.getConnection().request(topic, payload.data);

    return Payload.create(data);
  }

  async sendEvent(topic: string, payload: Payload): Promise<boolean> {
    this.getConnection().publish(topic, payload.data);

    return true;
  }

  async sendResponse(msg: NatsBrokerContext, payload: Payload): Promise<boolean> {
    return msg.respond(payload.data);
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
          payload: Payload.create(msg.data),
        });
      },
    });
  }

  private getConnection(): NatsConnection {
    if (!this.connection) {
      throw new InternalException('NATS connection is not available');
    }

    return this.connection;
  }
}
