import { resolve } from 'node:path';

export const ROOT_PATH = resolve(import.meta.dirname, '..', '..');

export const RESERVED_NAMES = new Set([
  'class',
  'function',
  'return',
  'var',
  'let',
  'const',
  'if',
  'else',
  'for',
  'while',
  'switch',
  'case',
  'break',
  'default',
  'new',
  'this',
  'super',
  'extends',
  'import',
  'export',
]);
