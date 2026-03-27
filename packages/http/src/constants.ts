export const HTTP_CONTROLLER_METADATA_KEYS = {
  path: Symbol('http(controller.path)'),
  methods: Symbol('http(controller.methods)'),
} as const;

export const HTTP_STATUS_MESSAGES = {
  100: 'Continue',
  200: 'OK',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  500: 'Internal Server Error',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  1000: 'Unknown Error',
} as const satisfies Record<number, string>;
