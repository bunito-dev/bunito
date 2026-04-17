import type { FetchHandler, WebSocketHandler } from '../types';

export interface RouterExtension {
  processWebSocketEvent?: WebSocketHandler;

  processFetchRequest?: FetchHandler;
}
