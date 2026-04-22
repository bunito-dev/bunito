import type { Buffer } from 'node:buffer';
import type { MaybePromise } from '@bunito/common';
import type { RequestId } from '@bunito/container';
import type { HTTP_ERROR_STATUS_CODES } from './constants';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      HOSTNAME?: string;
      SERVER_PORT?: string;
      SERVER_HOSTNAME?: string;
    }
  }
}

export type Server = Bun.Server<WebSocketData>;

export type ServerOptions = Bun.Serve.Options<WebSocketData>;

export type ServerFactory = (options: ServerOptions) => Server;

export type ServerRouteOptions = {
  path: HttpPath;
  method?: HttpMethod | null;
};

export type ServerRouteHandler = (
  request: ServerRequest,
  server: Server,
) => MaybePromise<Response | undefined>;

export type ServerRoutes = Record<
  HttpPath,
  Partial<Record<HttpMethod, ServerRouteHandler>>
>;

export type ServerRequest = Request & {
  params?: Record<string, string>;
};

export type ServerWebSocket = Bun.ServerWebSocket<WebSocketData>;

export type RequestQuery = Record<string, string | string[]>;

export type RequestContext = {
  requestId: RequestId;
  url: URL;
  path?: HttpPath;
  method: HttpMethod;
  params: Record<string, string>;
  query: RequestQuery;
  body: unknown;
  state: Record<string, unknown>;
  upgrade: (headers?: HeadersInit) => void;
};

export type RequestHandler = (
  request: Request,
  context: RequestContext,
) => MaybePromise<Response | null | undefined>;

export type HttpPath = `/${string}`;

export type HttpMethod = Bun.Serve.HTTPMethod;

export type HttpErrorStatus = keyof typeof HTTP_ERROR_STATUS_CODES;

export type WebSocketEvent =
  | {
      name: 'ping' | 'pong';
      data: Buffer;
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
      name: 'text';
      data: string;
    }
  | {
      name: 'binary';
      data: Buffer<ArrayBuffer>;
    };

export type WebSocketData = Omit<RequestContext, 'body' | 'upgrade'>;

export type WebSocketHandler = (
  event: WebSocketEvent,
  socket: ServerWebSocket,
) => MaybePromise<true | undefined>;
