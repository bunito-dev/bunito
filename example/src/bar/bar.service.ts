import type { ResolveConfig } from '@bunito/core';
import { Provider } from '@bunito/core';
import { barConfig } from './bar.config';

@Provider({
  injects: [barConfig],
})
export class BarService {
  constructor(private readonly config: ResolveConfig<typeof barConfig>) {}

  getConfig() {
    return this.config;
  }
}
