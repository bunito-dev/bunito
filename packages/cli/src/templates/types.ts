import type { Fn, RawObject } from '@bunito/common';

export type TemplateFactory = Fn<TemplateViews>;

export type TemplateViews = RawObject<{
  view: string;
  params?: RawObject;
}>;
