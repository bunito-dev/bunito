export class Exception extends Error {
  readonly description: string[] | undefined;

  constructor(messageLike: string | [string, ...string[]], cause?: unknown) {
    let message: string;
    let description: string[] | undefined;

    if (Array.isArray(messageLike)) {
      [message, ...description] = messageLike;
    } else {
      message = messageLike;
    }

    super(message);
    this.description = description;
    this.cause = cause;
  }
}
