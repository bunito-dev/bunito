import type { Buffer } from 'node:buffer';
import type { MaybePromise } from '@bunito/common';
import type { ServerWebSocket } from 'bun';
import type { RequestId } from '../container';
import type { Logger } from '../logger';

export type FetchContext = {
  requestId: RequestId;
  url: URL;
  data: Record<string, unknown>;
  logger?: Logger;
  upgrade: (headers?: HeadersInit) => boolean;
};

export type FetchHandler = (
  request: Request,
  context: FetchContext,
) => MaybePromise<Response | undefined | true>;

export type WebSocketData = {
  connectionId?: RequestId;
  url: URL;
  data: Record<string, unknown>;
  logger?: Logger;
};

export type WebSocketContext = {
  connectionId: RequestId;
  url: URL;
  data: Record<string, unknown>;
  logger?: Logger;
  socket: ServerWebSocket<WebSocketData>;
};

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
      name: 'message';
      data: string | Buffer<ArrayBuffer>;
    };

export type WebSocketHandler = (
  event: WebSocketEvent,
  context: WebSocketContext,
) => MaybePromise<undefined | true>;
