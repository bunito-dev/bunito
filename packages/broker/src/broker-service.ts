import { OnAppShutdown, OnAppStart } from '@bunito/app';
import type { CallableInstance, MaybePromise } from '@bunito/common';
import { InternalException } from '@bunito/common';
import type { ResolveConfig } from '@bunito/config';
import type { MatchedControllers } from '@bunito/container';
import { Container, Provider } from '@bunito/container';
import { Logger } from '@bunito/logger';
import { decode, encode } from '@msgpack/msgpack';
import { BrokerAdapter } from './broker-adapter';
import { BrokerConfig } from './broker-config';
import { BROKER_CONTROLLER_KEY } from './constants';
import { Context, Data, Payload, Subject, Topic } from './injections';
import type {
  BrokerMessage,
  ControllerDefinition,
  ControllerMethodOptions,
  HandlerDefinition,
} from './types';

@Provider({
  injects: [
    BrokerConfig,
    {
      useToken: Logger,
      optional: true,
    },
    Container,
    {
      useToken: BrokerAdapter,
      optional: true,
    },
  ],
})
export class BrokerService {
  private readonly adapter: BrokerAdapter;

  private readonly handlers = new Map<string, HandlerDefinition[]>();

  constructor(
    config: ResolveConfig<typeof BrokerConfig>,
    private readonly logger: Logger | null = null,
    private readonly container: Container,
    adapters: BrokerAdapter[] | null = null,
  ) {
    logger?.setContext(BrokerService);

    const { adapter: name } = config;

    if (!adapters?.length) {
      throw new InternalException('No adapters are available');
    }

    const adapter = name ? adapters.find(({ NAME }) => name === NAME) : adapters.at(0);

    if (!adapter) {
      throw new InternalException(`Adapter ${name} is not supported`);
    }

    this.adapter = adapter;
  }

  @OnAppStart()
  async connectAdapter(): Promise<void> {
    await this.adapter.connect?.();

    this.buildHandlers(this.container.locateComponents(BROKER_CONTROLLER_KEY));
  }

  @OnAppShutdown()
  async disconnectAdapter(): Promise<void> {
    await this.adapter.disconnect?.();
  }

  async sendEvent(topic: string, data: unknown): Promise<boolean> {
    return this.adapter.sendEvent(topic, this.encodePayload(data));
  }

  async sendRequest(
    topic: string,
    data: unknown,
    decode: false,
  ): Promise<Uint8Array | undefined>;
  async sendRequest<TOutput = unknown>(
    topic: string,
    data: unknown,
    decode?: true,
  ): Promise<TOutput | undefined>;
  async sendRequest(topic: string, data: unknown, decode = true): Promise<unknown> {
    const response = await this.adapter.sendRequest(topic, this.encodePayload(data));

    if (!response) {
      return;
    }

    if (!decode) {
      return response;
    }

    return this.decodePayload(response);
  }

  private async processMessage(pattern: string, message: BrokerMessage): Promise<void> {
    const handlers = this.handlers.get(pattern);

    if (!handlers) {
      return;
    }

    await this.container.runInRequestContext(async () => {
      for (const handler of handlers) {
        const {
          controller: { moduleId, providerId },
          propKey,
          injects = [],
        } = handler;

        const controller = await this.container.resolveProvider<
          CallableInstance<MaybePromise>
        >(providerId, {
          moduleId,
        });

        if (!controller[propKey]) {
          continue;
        }

        const args = await this.container.resolveInjections(injects, {
          moduleId,
          injectionResolver: async (token) => {
            let arg: unknown;

            switch (token) {
              case Context:
                arg = message.context;
                break;

              case Topic:
              case Subject:
                arg = message.topic;
                break;

              case Payload:
                arg = message.payload;
                break;

              case Data:
                arg = this.decodePayload(message.payload);
                break;
            }

            return arg;
          },
        });

        const data = await controller[propKey](...args);

        const { kind, context } = message;

        if (kind === 'request') {
          await this.adapter.sendResponse(context, this.encodePayload(data));
        }
      }
    });
  }

  private buildHandlers(
    matchedControllers?: MatchedControllers<unknown, ControllerMethodOptions>,
    parentPrefix = '',
  ): void {
    if (!matchedControllers) {
      return;
    }

    const { moduleId, props, controllers, children } = matchedControllers;

    let rootPrefix = parentPrefix;

    if (props) {
      for (const prop of props) {
        if (prop.propKind !== 'class') {
          continue;
        }

        const { options } = prop;

        if (options.kind === 'prefix' && options.prefix) {
          rootPrefix = `${rootPrefix}${options.prefix}.`;
        }
      }
    }

    if (controllers) {
      for (const { providerId, options, props } of controllers) {
        const controller: ControllerDefinition = {
          providerId,
          moduleId,
        };

        let prefix = rootPrefix;

        if (options.prefix) {
          prefix = `${prefix}${options.prefix}.`;
        }

        for (const prop of props) {
          if (prop.propKind !== 'class') {
            continue;
          }

          const { options } = prop;

          if (options.kind === 'prefix' && options.prefix) {
            prefix = `${prefix}${options.prefix}.`;
          }
        }

        for (const prop of props) {
          if (prop.propKind !== 'method') {
            continue;
          }

          const { propKey, options } = prop;

          if (options.kind === 'handler') {
            const {
              options: { injects, pattern },
            } = options;

            const prefixedPattern = `${prefix}${pattern}`;

            this.handlers
              .getOrInsertComputed(prefixedPattern, () => [])
              .push({
                injects,
                propKey,
                controller,
              });

            this.adapter.subscribe(prefixedPattern, (err, message) => {
              if (err) {
                this.logger?.error(err);
              }

              if (!message) {
                return;
              }

              this.processMessage(prefixedPattern, message).catch((err) => {
                this.logger?.error(err);
              });
            });
          }
        }
      }
    }

    if (children) {
      for (const child of children) {
        this.buildHandlers(child, rootPrefix);
      }
    }
  }

  private decodePayload(payload: Uint8Array): unknown {
    return decode(payload);
  }

  private encodePayload(data: unknown): Uint8Array {
    return encode(data ?? null);
  }
}
