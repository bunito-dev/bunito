import type { ModuleId, ProviderId, WithInjections } from '@bunito/container';

export type BrokerMessage<TContext = unknown> = {
  kind: 'request' | 'event';
  topic: string;
  payload: Uint8Array;
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
