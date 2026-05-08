import { describe, expect, it } from 'bun:test';

describe('main', () => {
  it('prints CLI help from the binary entrypoint', async () => {
    const proc = Bun.spawn(['bun', 'packages/cli/src/main.ts', '--help'], {
      stdout: 'pipe',
      stderr: 'pipe',
    });

    const [stdout, stderr, code] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ]);

    expect(code).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toContain('bunito <command>');
    expect(stdout).toContain('Start the app(s)');
  });
});
