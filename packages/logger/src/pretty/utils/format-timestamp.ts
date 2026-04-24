export function formatTimestamp(timestamp: Date): string {
  const time = [timestamp.getHours(), timestamp.getMinutes(), timestamp.getSeconds()]
    .map((part) => part.toString().padStart(2, '0'))
    .join(':');

  return `[${time}.${timestamp.getMilliseconds().toString().padStart(3, '0')}]`;
}
