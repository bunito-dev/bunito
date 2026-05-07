import process from 'node:process';
import { styleText } from 'node:util';
import { PROCESS_COLORS } from './constants';
import type { ProcessOptions, ProcessRunning, ProcessWriter } from './types';

export class SpawnService {
  private readonly textDecoder = new TextDecoder();

  private readonly processes: ProcessRunning[] = [];

  addProcess(options: ProcessOptions): void {
    const { name, args, envs = {} } = options;

    this.processes.push({
      name,
      proc: Bun.spawn(args, {
        stdout: 'pipe',
        stderr: 'pipe',
        stdin: 'inherit',
        env: {
          ...process.env,
          ...envs,
        },
      }),
    });
  }

  async startProcesses(padRefix = false): Promise<number> {
    const finished: Promise<number>[] = [];

    const { stdout, stderr } = process;

    const usePrefix = this.processes.length > 1;

    let prefixWidth = 0;

    if (usePrefix) {
      for (const { name } of this.processes) {
        prefixWidth = Math.max(prefixWidth, name.length);
      }
    }

    for (const [index, { name, proc }] of this.processes.entries()) {
      let prefix = '';

      if (usePrefix) {
        const color = PROCESS_COLORS[index % PROCESS_COLORS.length];

        if (color) {
          prefix = padRefix ? name.padStart(prefixWidth) : name;
          prefix = styleText(color, `${prefix} → `);
        }
      }

      const writeOut: ProcessWriter = (buffer: string): void => {
        stdout.write(`${prefix}${buffer}\n`);
      };

      const writeErr: ProcessWriter = (buffer: string): void => {
        stderr.write(`${prefix}${buffer}\n`);
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
            `Finished with exit code ${code}`,
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

    return await Promise.all(finished).then((codes) => Math.max(...codes));
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
