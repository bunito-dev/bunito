import type { Buffer } from 'node:buffer';
import type { RawObject } from '@bunito/common';
import type { BunServer } from './bun-server';

export type HTTPMethod = Bun.Serve.HTTPMethod;

export type BunServerOptions = Pick<Bun.Serve.Options<unknown>, 'port' | 'hostname'> & {
  error: (error: unknown) => Response;
  fetch: BunRouteHandler;
  routes?: Record<string, BunRouteHandler>;
  websocket?: Bun.Serve.Options<unknown>['websocket'];
};

export type BunServerFactory = (options: BunServerOptions) => BunServer;

export type BunRouteHandler = (request: BunRequest) => Promise<Response | undefined>;

export type BunRequest = Request & {
  params?: RawObject<string>;
};

export type BunRequestRoute = {
  path: string;
  method: HTTPMethod;
  params: RawObject<string>;
};

export type BunRequestContext = {
  route?: BunRequestRoute;
  upgrade: <TOptions extends RawObject>(
    options?: TOptions & { headers?: HeadersInit },
  ) => boolean;
};

export type BunWebSocketEvent =
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
