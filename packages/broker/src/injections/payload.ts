import type { InjectionTokenOptions } from '@bunito/container';

export type Payload = Uint8Array;

export function Payload(): InjectionTokenOptions {
  return {
    useToken: Payload,
  };
}
