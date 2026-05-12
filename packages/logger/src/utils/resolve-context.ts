import { isFn, isString } from '@bunito/common';

export function resolveContext(contextLike: unknown, sep = '.'): string | undefined {
  if (Array.isArray(contextLike)) {
    if (contextLike.length === 0) {
      return;
    }

    const parts = contextLike.map((item) => resolveContext(item, sep)).filter(Boolean);

    return parts.length ? parts.join(sep) : undefined;
  }

  if (isString(contextLike, true)) {
    return contextLike;
  }

  if (isFn(contextLike) && isString(contextLike.name, true)) {
    return contextLike.name;
  }
}
