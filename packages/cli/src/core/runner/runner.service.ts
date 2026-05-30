import { styleText } from 'node:util';
import { Provider } from '@bunito/container';
import { Logger } from '@bunito/logger';
import { DEFAULT_PROCESS_ENVS } from './constants';
import type { ProcessLabelStyle, ProcessOptions, ProcessRunning } from './types';

@Provider({
  injects: [Logger, null, null],
  scope: 'transient',
})
export class RunnerService {
  private readonly processes: ProcessRunning[] = [];

  constructor(
    private readonly logger: Logger,
    private readonly textDecoder = new TextDecoder(),
    private readonly defaultEnvs: Record<
      string,
      string | undefined
    > = DEFAULT_PROCESS_ENVS,
  ) {
    //
  }

  addProcess(options: ProcessOptions): void {
    const { name, prefix, args, envs = {} } = options;

    this.processes.push({
      name,
      prefix,
      logger: this.logger?.clone(),
      proc: Bun.spawn(args, {
        stdout: 'pipe',
        stderr: 'pipe',
        stdin: 'inherit',
        env: {
          ...this.defaultEnvs,
          ...envs,
        },
      }),
    });
  }

  async startProcesses(labelStyle: ProcessLabelStyle): Promise<number> {
    if (!this.processes.length) {
      return 0;
    }

    const finished: Promise<number>[] = [];

    for (const { prefix, logger, proc } of this.processes) {
      if (prefix) {
        const pid = proc.pid;

        let label: string;

        const pidLabel = `[${pid}]`;

        switch (labelStyle) {
          case 'pid':
            label = pidLabel;
            break;

          case 'name':
            label = prefix;
            break;

          default:
            label = `${pidLabel} ${prefix}`;
        }

        logger.usePrefix(label);
      }

      finished.push(
        Promise.all([
          this.pipeWriter(proc.stdout.getReader(), (buffer) => logger.info(buffer)),
          this.pipeWriter(proc.stderr.getReader(), (buffer) => logger.info(buffer)),
          proc.exited,
        ]).then((codes) => {
          const code = Math.max(...codes);
          const message = styleText(
            [code ? 'red' : 'gray', 'italic'],
            `Process finished with exit code ${code}`,
          );

          logger.info(message);

          return code;
        }),
      );
    }

    return Promise.all(finished).then((codes) => Math.max(...codes));
  }

  private async pipeWriter(
    input: ReadableStreamDefaultReader<Uint8Array<ArrayBuffer>>,
    write: (buffer: string) => void,
  ): Promise<number> {
    let buffer = '';

    while (true) {
      const { done, value } = await input.read();

      if (done) {
        if (buffer) {
          write(buffer);
        }

        break;
      }

      buffer += this.textDecoder.decode(value, { stream: true });

      const lines = buffer.split('\n');

      buffer = lines.pop() ?? '';

      for (const line of lines) {
        write(line);
      }
    }

    return 0;
  }
}
