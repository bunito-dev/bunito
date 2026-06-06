import { Decoder, Encoder } from '@msgpack/msgpack';

export class Payload {
  private static readonly encoder = new Encoder();

  private static readonly decoder = new Decoder();

  static create(value: unknown): Payload {
    if (value === undefined || value === null) {
      return new Payload(new Uint8Array());
    }

    if (value instanceof Uint8Array) {
      return new Payload(value);
    }

    if (value instanceof Payload) {
      return value;
    }

    return Payload.encode(value);
  }

  static encode(value: unknown): Payload {
    return new Payload(Payload.encoder.encode(value));
  }

  private decoded: unknown;

  constructor(readonly data: Uint8Array) {}

  decode<TValue = unknown>(): TValue {
    if (this.decoded === undefined) {
      this.decoded = this.data.length ? Payload.decoder.decode(this.data) : null;
    }

    return this.decoded as TValue;
  }
}
