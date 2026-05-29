import process from 'node:process';
import { styleText } from 'node:util';
import { Provider } from '@bunito/container';
import { Logger } from '@bunito/logger';
import type {
  ProcessOptions,
  ProcessRunning,
  ProcessWriter,
  StartProcessOptions,
} from './types';

@Provider({
  injects: [Logger, null, null],
})
export class RunnerService {
  private readonly processes: ProcessRunning[] = [];

  constructor(
    private readonly logger: Logger,
    private readonly textDecoder = new TextDecoder(),
    private readonly defaultEnvs: Record<string, string | undefined> = Object.fromEntries(
      Object.entries(process.env).filter(([key]) => {
        switch (key) {
          case 'PATH':
          case 'USER':
          case 'TZ':
          case 'LANG':
          case 'PWD':
            return true;

          default:
            return key.startsWith('npm_') || key.startsWith('BUN_');
        }
      }),
    ),
  ) {
    //
  }

  addProcess(options: ProcessOptions): void {
    const { name, args, envs = {} } = options;

    this.processes.push({
      name,
      logger: this.logger.clone(),
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

  async startProcesses(options: StartProcessOptions): Promise<number> {
    if (!this.processes.length) {
      return 0;
    }

    const finished: Promise<number>[] = [];

    const usePrefix = this.processes.length > 1;

    let prefixWidth = 0;

    if (usePrefix) {
      for (const { name } of this.processes) {
        prefixWidth = Math.max(prefixWidth, name.length);
      }
    }

    for (const { name, logger, proc } of this.processes) {
      if (usePrefix) {
        const pid = proc.pid;

        let label: string;

        const pidLabel = `[${pid}]`;
        const nameLabel = name.padEnd(prefixWidth, '_');

        switch (options.label) {
          case 'pid':
            label = pidLabel;
            break;

          case 'name':
            label = nameLabel;
            break;

          default:
            label = `${pidLabel} ${nameLabel}`;
        }

        logger.usePrefix(label);
      }

      const writeOut: ProcessWriter = (buffer: string): void => {
        logger.verbose(buffer);
      };

      const writeErr: ProcessWriter = (buffer: string): void => {
        logger.verbose(buffer);
      };

      finished.push(
        Promise.all([
          this.pipeWriter(proc.stdout.getReader(), writeOut),
          this.pipeWriter(proc.stderr.getReader(), writeErr),
          proc.exited,
        ]).then((codes) => {
          const code = Math.max(...codes);
          const message = styleText(
            [code ? 'red' : 'gray', 'italic'],
            `Process finished with exit code ${code}`,
          );

          if (code) {
            writeErr(message);
          } else {
            writeOut(message);
          }

          return code;
        }),
      );
    }

    return Promise.all(finished).then((codes) => Math.max(...codes));
  }

  private async pipeWriter(
    input: ReadableStreamDefaultReader<Uint8Array<ArrayBuffer>>,
    write: ProcessWriter,
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
