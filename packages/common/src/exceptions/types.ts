export type ExceptionOptions<TData> = {
  message?: string;
  data?: TData;
  cause?: unknown;
};
