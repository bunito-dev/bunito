import type { ModuleId, ProviderId, WithInjections } from '@bunito/container';
import type { Payload } from './utils';

export type BrokerMessage<TContext = unknown> = {
  kind: 'request' | 'event';
  topic: string;
  payload: Payload;
  context: TContext;
};

export type BrokerMessageHandler<TContext = unknown> = (
  err: unknown,
  message?: BrokerMessage<TContext>,
) => void;

export type ControllerDefinition = {
  moduleId: ModuleId;
  providerId: ProviderId;
};

export type ControllerMethodOptions = {
  kind: 'handler';
  options: HandlerOptions;
};

export type HandlerOptions = WithInjections<{
  pattern: string;
}>;

export type HandlerDefinition = WithInjections<{
  controller: ControllerDefinition;
  propKey: PropertyKey;
}>;
