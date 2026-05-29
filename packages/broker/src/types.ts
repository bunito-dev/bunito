import type { ModuleId, ProviderId, WithInjections } from '@bunito/container';

export type BrokerMessage<TContext = unknown, TPayload = Uint8Array> = {
  kind: 'request' | 'event';
  topic: string;
  payload: TPayload;
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
