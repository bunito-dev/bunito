export function formatValueAsBoolean(value: string): boolean | undefined {
  switch (value.toLowerCase()) {
    case 'true':
    case 't':
    case 'yes':
    case 'y':
    case 'on':
      return true;

    case 'false':
    case 'f':
    case 'no':
    case 'n':
    case 'off':
      return false;

    default:
      return;
  }
}
