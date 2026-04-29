import { describe, expect, it } from 'bun:test';
import * as utils from './index';

describe('metadata utils index', () => {
  it('re-exports metadata utility functions', () => {
    expect(utils.getClassMetadata).toBeFunction();
    expect(utils.initClassMetadata).toBeFunction();
    expect(utils.setClassDecoratorMetadata).toBeFunction();
  });
});
