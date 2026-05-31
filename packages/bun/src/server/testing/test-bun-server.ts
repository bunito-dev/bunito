import { mock } from 'bun:test';
import type { MockedObject } from '@bunito/testing';
import { TestException } from '@bunito/testing';
import type { BunServer } from '../bun-server';
import type { BunServerOptions } from '../types';
import type { TestBunRouteMatch } from './types';
import { getPathSegments, RequestBuilder } from './utils';

export class TestBunServer implements MockedObject<BunServer> {
  readonly url = new URL('http://TESTING');

  options: BunServerOptions | undefined;

  start = mock((options: BunServerOptions) => {
    this.options = options;
    return this;
  });

  stop = mock(async () => {
    this.options = undefined;
  });

  upgrade = mock(() => {
    return false;
  });

  buildRequest(path?: `/${string}`): RequestBuilder {
    return new RequestBuilder(this, path);
  }

  async sendRequest(request: Request): Promise<Response | undefined> {
    const options = this.options;

    if (!options) {
      throw new TestException('Server not started');
    }

    try {
      const url = new URL(request.url);
      const match = this.matchRoute(url.pathname);

      if (!match) {
        return await options.fetch(request);
      }

      const routeRequest = request as Request & {
        params?: Record<string, string>;
      };

      routeRequest.params = match.params;

      return await match.handler(routeRequest);
    } catch (err) {
      return options.error(err);
    }
  }

  private matchRoute(pathname: string): TestBunRouteMatch | undefined {
    const routes = this.options?.routes;

    if (!routes) {
      return;
    }

    let bestMatch: TestBunRouteMatch | undefined;

    for (const [path, handler] of Object.entries(routes)) {
      const match = this.matchRoutePath(path, pathname);

      if (!match) {
        continue;
      }

      if (!bestMatch || match.score > bestMatch.score) {
        bestMatch = {
          path,
          handler,
          ...match,
        };
      }
    }

    return bestMatch;
  }

  private matchRoutePath(
    routePath: string,
    pathname: string,
  ): Pick<TestBunRouteMatch, 'params' | 'score'> | undefined {
    const routeSegments = getPathSegments(routePath);
    const pathSegments = getPathSegments(pathname);
    const params: Record<string, string> = {};

    let score = 0;

    for (let index = 0; index < routeSegments.length; index++) {
      const routeSegment = routeSegments[index];
      const pathSegment = pathSegments[index];

      if (routeSegment === '*') {
        if (index >= pathSegments.length) {
          return;
        }

        return { params, score };
      }

      if (!pathSegment) {
        return;
      }

      if (routeSegment?.startsWith(':')) {
        params[routeSegment.slice(1)] = decodeURIComponent(pathSegment);
        score += 2;
        continue;
      }

      if (routeSegment !== pathSegment) {
        return;
      }

      score += 4;
    }

    if (routeSegments.length !== pathSegments.length) {
      return;
    }

    return { params, score };
  }
}
