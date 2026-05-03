import type { RequestContext } from '@bunito/bun/internals';
import { ServerRouter } from '@bunito/bun/internals';
import { Container, OnInit } from '@bunito/container';
import type { MatchedComponents } from '@bunito/container/internals';
import { Controller } from './decorators';
import type {
  ControllerClassOptions,
  ControllerMethodOptions,
  ControllerOptions,
} from './types';

@ServerRouter()
export class HttpRouter implements ServerRouter {
  @OnInit({
    injects: [Container],
  })
  configure(container: Container): void {
    this.processControllerComponent(container.locateComponents(Controller));
  }

  async processRequest(
    _request: Request,
    _context: RequestContext,
  ): Promise<Response | undefined> {
    return Response.json({ message: 'Hello World!' });
  }

  private processControllerComponent(
    matched:
      | MatchedComponents<
          ControllerOptions,
          {
            class: ControllerClassOptions;
            method: ControllerMethodOptions;
          }
        >
      | undefined,
  ) {
    if (!matched) {
      return;
    }

    const { moduleId, components, children } = matched;

    if (components) {
      for (const component of components) {
        const { options } = component;

        if ('useProvider' in component) {
          const { useProvider: providerId } = component;

          console.log({ moduleId, providerId, options });
          continue;
        }

        console.log({ moduleId, options });
      }
    }

    if (children) {
      for (const child of children) {
        this.processControllerComponent(child);
      }
    }
  }
}
