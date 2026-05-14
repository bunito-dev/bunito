import type { ModuleId, ProviderId, WithInjections } from '@bunito/container';

export type MessagePayload<TContext = unknown> = {
  kind: 'request' | 'event';
  topic: string;
  data: unknown;
  context: TContext;
};

export type MessageHandler<TContext = unknown> = (
  err: unknown,
  payload?: MessagePayload<TContext>,
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
