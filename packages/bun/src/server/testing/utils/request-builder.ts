import type { HTTPMethod } from '../../types';
import type { TestBunServer } from '../test-bun-server';

export class RequestBuilder {
  private method: HTTPMethod = 'GET';
  private headers: Headers = new Headers();
  private body: BodyInit | undefined;

  constructor(
    private readonly server: TestBunServer,
    private readonly path: `/${string}` = '/',
  ) {}

  withMethod(method: HTTPMethod): this {
    this.method = method;
    return this;
  }

  withHeaders(headers: HeadersInit): this {
    for (const [key, value] of new Headers(headers).entries()) {
      this.headers.set(key, value);
    }

    return this;
  }

  withBody(body?: BodyInit): this {
    this.body = body;
    return this;
  }

  clone(): RequestBuilder {
    return new RequestBuilder(this.server, this.path)
      .withMethod(this.method)
      .withHeaders(this.headers)
      .withBody(this.body);
  }

  build(): Request {
    const url = new URL(this.path, this.server.url);
    const options: RequestInit = {
      method: this.method,
      headers: this.headers,
      body: this.body,
    };

    return new Request(url, options);
  }

  async send(): Promise<Partial<Response>> {
    return this.server.sendRequest(this.build()).then((response) => response ?? {});
  }
}
