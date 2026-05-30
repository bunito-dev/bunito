export type AppAction = 'start' | 'shutdown';

export type AppEvents = {
  ready: [];
  shutdown: [];
  action: [action: AppAction];
  error: [err: unknown];
};

export type AppOptions = {
  silent?: boolean;
};
