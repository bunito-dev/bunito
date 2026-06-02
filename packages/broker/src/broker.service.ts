import { OnAppShutdown, OnAppStart } from '@bunito/app';
import type { CallableInstance, MaybePromise } from '@bunito/common';
import { InternalException } from '@bunito/common';
import type { ResolveConfig } from '@bunito/config';
import type { MatchedControllers } from '@bunito/container';
import { Container, optional, Provider } from '@bunito/container';
import { Logger } from '@bunito/logger';
import { BrokerConfig } from './broker.config';
import { BrokerAdapter } from './broker-adapter';
import { BROKER_CONTROLLER_KEY } from './constants';
import { Context, Data, Subject, Topic } from './injections';
import type {
  BrokerMessage,
  ControllerDefinition,
  ControllerMethodOptions,
  HandlerDefinition,
} from './types';
import { Payload } from './utils';

@Provider({
  global: true,
  injects: [BrokerConfig, optional(Logger), Container, optional(BrokerAdapter)],
})
export class BrokerService {
  private readonly adapter: BrokerAdapter;

  private readonly handlers = new Map<string, HandlerDefinition[]>();

  private readonly subscriptions = new Set<() => void>();

  constructor(
    config: ResolveConfig<typeof BrokerConfig>,
    private readonly logger: Logger | null,
    private readonly container: Container,
    adapters: BrokerAdapter[] | null,
  ) {
    const { adapter: name } = config;

    if (!adapters?.length) {
      throw new InternalException('No broker adapters are available');
    }

    const adapter = name ? adapters.find(({ NAME }) => name === NAME) : adapters.at(0);

    if (!adapter) {
      throw new InternalException(`Broker adapter "${name}" is not supported`);
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
    for (const subscription of this.subscriptions) {
      subscription();
    }

    this.subscriptions.clear();

    await this.adapter.disconnect?.();
  }

  async sendEvent(topic: string, data: unknown): Promise<boolean> {
    return this.adapter.sendEvent(topic, Payload.create(data));
  }

  async sendRequest(topic: string, data: unknown): Promise<Payload | undefined> {
    return this.adapter.sendRequest(topic, Payload.create(data));
  }

  subscribe(topic: string, handler: (payload: Payload) => void): () => void {
    const subscription = this.adapter.subscribe(topic, (err, message) => {
      if (err) {
        this.logger?.error(err);
      }

      if (!message) {
        return;
      }

      handler(message.payload);
    });

    this.subscriptions.add(subscription);

    return () => {
      this.subscriptions.delete(subscription);
      subscription();
    };
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
                arg = message.payload.decode();
                break;
            }

            return arg;
          },
        });

        const data = await controller[propKey](...args);

        const { kind, context } = message;

        if (kind === 'request') {
          await this.adapter.sendResponse(context, Payload.create(data));
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

            this.subscriptions.add(
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
              }),
            );
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
}
