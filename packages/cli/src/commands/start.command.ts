import process from 'node:process';
import { styleText } from 'node:util';
import type { Project } from '../project';

export class StartCommand {
  private readonly textDecoder = new TextDecoder();

  constructor(private readonly project: Project) {}

  public async run(options: {
    apps: Set<string> | undefined;
    watch: boolean;
    prod: boolean;
  }): Promise<void> {
    const pending: Promise<unknown>[] = [];

    const apps = this.project.getApps(options.apps);

    if (!apps.length) {
      throw new Error('No apps found');
    }

    for (const { prefix, entry, envs = {} } of apps) {
      let optionalPrefix = '';

      if (apps.length > 1) {
        optionalPrefix = prefix;
      }

      const args = ['bun', 'run'];

      if (options.watch) {
        args.push('--watch', '--no-clear-screen');
      }

      const proc = Bun.spawn([...args, entry], {
        stdout: 'pipe',
        stderr: 'pipe',
        stdin: 'inherit',
        env: {
          ...process.env,
          NODE_ENV: options.prod ? 'production' : 'development',
          ...envs,
        },
      });

      pending.push(
        this.pipeStreamWithPrefix(
          optionalPrefix,
          proc.stdout.getReader(),
          process.stdout,
        ),
        this.pipeStreamWithPrefix(
          optionalPrefix,
          proc.stderr.getReader(),
          process.stderr,
        ),
        proc.exited.then((code) => {
          if (!code) {
            console.log(
              `${optionalPrefix}${styleText(['italic', 'gray'], `Exit with code ${code}`)}`,
            );
          } else {
            console.log(
              `${optionalPrefix}${styleText(['italic', 'red'], `Exit with code ${code}`)}`,
            );
          }
        }),
      );
    }

    await Promise.all(pending);
  }

  private async pipeStreamWithPrefix(
    prefix: string,
    input: ReadableStreamDefaultReader<Uint8Array<ArrayBuffer>>,
    output: NodeJS.WriteStream,
  ): Promise<void> {
    let buffer = '';

    while (true) {
      const { done, value } = await input.read();

      if (done) {
        if (buffer) {
          output.write(`${prefix}${buffer}\n`);
        }

        break;
      }

      buffer += this.textDecoder.decode(value, { stream: true });

      const lines = buffer.split('\n');

      buffer = lines.pop() ?? '';

      for (const line of lines) {
        output.write(`${prefix}${line}\n`);
      }
    }
  }
}
