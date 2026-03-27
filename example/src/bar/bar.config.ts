import { registerConfig } from '@bunito/core';

export const barConfig = registerConfig('bar', () => {
  return {
    b: 'b',
    a: 1,
    r: true,
  };
});
