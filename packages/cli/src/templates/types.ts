import type { Fn, RawObject } from '@bunito/common';

export type Template = Fn<TemplateResult>;
export type TemplateResult = RawObject<string | RawObject>;
