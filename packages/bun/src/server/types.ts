import type { Buffer } from 'node:buffer';
import type { RawObject } from '@bunito/common';

export type BunServer = Bun.Server<unknown>;

export type BunServerOptions = Bun.Serve.Options<unknown>;

export type BunServerFactory = (options: BunServerOptions) => BunServer;

export type BunRequest = Request & {
  params?: RawObject<string>;
};

export type BunWebSocket = Bun.ServerWebSocket<unknown>;

export type HTTPMethod = Bun.Serve.HTTPMethod;

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
