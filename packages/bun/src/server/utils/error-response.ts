export class ErrorResponse extends Response {
  constructor(status: 404 | 500) {
    let body: string;

    switch (status) {
      case 404:
        body = 'Not Found';
        break;

      case 500:
        body = 'Internal Server Error';
        break;
    }

    super(body, { status });
  }
}
