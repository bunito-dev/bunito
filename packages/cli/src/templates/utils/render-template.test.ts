import { describe, expect, it } from 'bun:test';
import { renderTemplate } from './render-template';

describe('renderTemplate', () => {
  it('renders string and object template values', () => {
    const result = renderTemplate(() => ({
      'src/main.ts': `
        const value = 1;
      `,
      'package.json': {
        name: 'demo',
      },
    }));

    expect(result).toEqual({
      'src/main.ts': 'const value = 1;\n',
      'package.json': '{\n  "name": "demo"\n}',
    });
  });
});
