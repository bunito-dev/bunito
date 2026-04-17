import { join } from 'node:path';
import { styleText } from 'node:util';
import { isObject } from '@bunito/common';
import { APP_COLORS, PROJECT_FILES } from './constants';
import type { ProjectApp, ProjectConfig } from './types';
import { readJSON } from './utils';

export class Project {
  static async read(root: string): Promise<Promise<Project> | undefined> {
    const projectPkg = await readJSON<{ name: string }>(join(root, PROJECT_FILES.pkg));

    if (!isObject(projectPkg) || !projectPkg.name) {
      return;
    }

    const projectConfig = await readJSON<ProjectConfig>(join(root, PROJECT_FILES.config));

    if (!isObject(projectConfig)) {
      return;
    }

    const { apps } = projectConfig;

    if (!isObject(apps)) {
      throw new Error('Project config must contain apps');
    }

    const { name } = projectPkg;

    return new Project(
      root,
      name,
      Object.entries(apps).map(([name, { entry, ...app }], index) => {
        const color = APP_COLORS.at(index % APP_COLORS.length) ?? 'white';

        return {
          ...app,
          name,
          entry: join(root, entry),
          prefix: `${styleText(color, `${name}`)} ❯ `,
        };
      }),
    );
  }

  constructor(
    private readonly root: string,
    private readonly name: string,
    private readonly apps: ProjectApp[],
  ) {}

  getApps(names?: Set<string>): ProjectApp[] {
    return names ? this.apps.filter(({ name }) => names.has(name)) : this.apps;
  }
}
