import type { Buffer } from 'node:buffer';
import type { RawObject } from '@bunito/common';

export type Server = Bun.Server<unknown>;

export type ServerOptions = Bun.Serve.Options<unknown>;

export type HTTPMethod = Bun.Serve.HTTPMethod;

export type ServerRequest = Request & {
  params?: RawObject<string>;
};

export type ServerWebSocket = Bun.ServerWebSocket<unknown>;

export type WebSocketEvent =
  | {
      name: 'text';
      data: string;
    }
  | {
      name: 'binary';
      data: Buffer<ArrayBuffer>;
    }
  | {
      name: 'open' | 'drain';
    }
  | {
      name: 'close';
      code: number;
      reason: string;
    }
  | {
      name: 'ping' | 'pong';
      data: Buffer<ArrayBufferLike>;
    };

export type RequestRoute = {
  path: string;
  method: HTTPMethod;
  params: RawObject<string>;
};

export type RequestContext = {
  route?: RequestRoute;
  upgrade: <TOptions extends RawObject>(
    options?: TOptions & { headers?: HeadersInit },
  ) => boolean;
};
