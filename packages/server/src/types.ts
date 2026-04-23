import type { MaybePromise, RawObject } from '@bunito/common';
import type { HTTP_ERROR_STATUS_CODES } from './constants';
import type { RequestContext, WebSocketContext } from './contexts';

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

export type Server = Bun.Server<RawObject>;

export type ServerOptions = Bun.Serve.Options<RawObject>;

export type ServerFactory = (options: ServerOptions) => Server;

export type ServerWebSocket = Bun.ServerWebSocket<RawObject>;

export type ServerRouteOptions = {
  path: HttpPath;
  method?: HttpMethod | null;
};

export type ServerRoutes = Record<
  HttpPath,
  Partial<
    Record<
      HttpMethod,
      (request: Request, server: Server) => MaybePromise<Response | undefined>
    >
  >
>;

export type HttpPath = `/${string}`;

export type HttpMethod = Bun.Serve.HTTPMethod;

export type HttpErrorStatus = keyof typeof HTTP_ERROR_STATUS_CODES;

export type RequestUrl = URL & { pathname: HttpPath };

export type RequestQuery = RawObject<string | string[]>;

export type RequestParams = RawObject<string>;

export type RequestHandler = (
  context: RequestContext,
) => MaybePromise<Response | null | undefined>;

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

export type WebSocketHandler = (
  context: WebSocketContext,
) => MaybePromise<false | undefined>;
