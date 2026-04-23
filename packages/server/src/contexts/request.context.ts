import type { RawObject } from '@bunito/common';
import { isString } from '@bunito/common';
import type { Id } from '@bunito/container';
import type { TraceLogger } from '@bunito/logger';
import type {
  HttpMethod,
  HttpPath,
  RequestParams,
  RequestQuery,
  RequestUrl,
} from '../types';

export class RequestContext {
  private readonly state: {
    url?: RequestUrl;
    query?: RequestQuery;
  } = {};

  readonly params: RequestParams;

  body: unknown;

  constructor(
    readonly requestId: Id,
    readonly request: Request & { params?: RequestParams },
    readonly path: HttpPath | undefined,
    readonly server: Bun.Server<RawObject>,
    readonly logger: TraceLogger | undefined,
  ) {
    this.params = request.params ?? {};
  }

  get url(): RequestUrl {
    if (!this.state.url) {
      this.state.url = new URL(this.request.url) as RequestUrl;
    }

    return this.state.url;
  }

  get method(): HttpMethod {
    return this.request.method as HttpMethod;
  }

  get headers(): Headers {
    return this.request.headers;
  }

  get query(): RequestQuery {
    if (!this.state.query) {
      const query: RequestQuery = {};

      for (const [key, value] of this.url.searchParams.entries()) {
        if (!query[key]) {
          query[key] = value;
          continue;
        }

        if (isString(query[key])) {
          query[key] = [query[key], value];
          continue;
        }

        query[key].push(value);
      }

      this.state.query = query;
    }

    return this.state.query;
  }

  upgrade<TData extends RawObject>(options?: TData & { headers?: HeadersInit }): boolean {
    let headers: HeadersInit | undefined;
    let data: RawObject;

    if (options) {
      ({ headers, ...data } = options);
    } else {
      data = {};
    }

    return this.server.upgrade(this.request, {
      headers,
      data,
    });
  }
}
