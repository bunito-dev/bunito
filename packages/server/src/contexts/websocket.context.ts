import type { RawObject } from '@bunito/common';
import type { ServerWebSocket, WebSocketEvent } from '../types';

export class WebSocketContext {
  constructor(
    readonly event: WebSocketEvent,
    readonly socket: ServerWebSocket,
  ) {
    //
  }

  get data(): RawObject {
    return this.socket.data;
  }
}
