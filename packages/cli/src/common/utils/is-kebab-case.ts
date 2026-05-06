import { toKebabCase } from './to-kebab-case';

export function isKebabCase(value: string): boolean {
  return !!value && value === toKebabCase(value);
}
