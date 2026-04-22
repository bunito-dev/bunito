import { App, LoggerModule } from '@bunito/bunito';
import type {
  RequestContext,
  ServerRouteOptions,
  ServerWebSocket,
  WebSocketEvent,
} from '@bunito/server';
import { ServerExtension, ServerModule } from '@bunito/server';

@ServerExtension()
class HttpExtension implements ServerExtension {
  getRoutes(): ServerRouteOptions[] {
    return [
      {
        path: '/**',
        method: 'GET',
        propKey: 'bar',
      },
      {
        path: '/',
        method: 'GET',
        propKey: 'bar',
      },
      {
        path: '/a/:aaa/:bbb',
        method: 'GET',
        propKey: 'bar',
      },
      {
        path: '/a/x/*/:aaa',
        method: 'GET',
        propKey: 'bar',
      },
      {
        path: '/a/*',
        method: 'GET',
        propKey: 'bar',
      },
    ];
  }

  bar(request: Request, context: RequestContext) {
    const { params, method, path, query } = context;

    return Response.json({
      propKey: 'bar',
      context: {
        params,
        method,
        path,
        query,
      },
    });
  }

  processEvent(event: WebSocketEvent, socket: ServerWebSocket): true {
    return true;
  }

  processRequest(request: Request, context: RequestContext) {
    const { params, method, path, query } = context;

    return Response.json({
      propKey: 'processRequest',
      context: {
        params,
        method,
        path,
        query,
      },
    });
  }
}

await App.start({
  imports: [LoggerModule, ServerModule],
  extensions: [HttpExtension],
});
